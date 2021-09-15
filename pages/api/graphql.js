import { gql, ApolloServer } from "apollo-server-micro";
import Cors from "cors";
import knex from "knex";
import DataLoader from "dataloader";
import { typeDefs } from "../../graphql/typedefs";
import { EXPIRATION_DATE, ONE_HOUR, resolvers } from "../../graphql/resolvers";
import jwt from "jsonwebtoken";
import { delBasePath } from "next/dist/shared/lib/router/router";
import cookieParser from "cookie-parser";
import cookie from "cookie";
const cors = Cors({
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  credentials: true,
});

import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  isAuthenticated,
  isCurrentUserDirectiveTransformer,
  permission,
  upperDirectiveTransformer,
} from "../../graphql/directives";
import { newCookie } from "../../utils";

// export const posgres = new knex({
//   client: "pg",
//   version: "8.7.1",
//   connection: {
//     connectionString: process.env.PG_CONNECTION_STRING,
//     ssl: {
//       rejectUnauthorized: false,
//   },
//   debug: true,
// });

const connection =
  process.NODE_ENV === "development"
    ? {
        host: "127.0.0.1",
        port: 5432,
        user: "kimsong",
        password: "",
        database: "graphql-nextjs",
      }
    : {
        connectionString: process.env.PG_CONNECTION_STRING,
        ssl: {
          rejectUnauthorized: false,
        },
      };

export const posgres = new knex({
  client: "pg",
  version: "8.7.1",
  connection,
  debug: true,
});

//#region TEST CONNECTION
// posgres
//   .raw("SELECT name FROM people WHERE id = '1'")
//   .then((data) => {
//     console.log("PostgreSQL connected", data);
//   })
//   .catch((e) => {
//     console.log("PostgreSQL not connected");
//     console.error(e);
//   });
//#endregion

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      // console.log("hi from middleware");
      req.bruh = "bruh";
      return resolve(result);
    });
  });
}
// type Query {
//   getUsers(first: Int = 25, skip: Int = 0): [User!]!
// }

// const loader = {
//   user: new DataLoader((ids) => {
//     posgres
//       .select("*")
//       .from("people")
//       .whereIn("id", ids)
//       .then((row) => ids.map((id) => row.find((row) => row.id === id)));
//   }),
// };

let schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

schema = isCurrentUserDirectiveTransformer(schema, "isCurrentUser");
schema = isAuthenticated(schema, "authenticated");
schema = permission(schema, "permission");

//
// DATALOADER
// implementing dataloader to avoid the n+1 queries (met it with the searchBook query)
const loader = {
  authors: new DataLoader(async (ids) => {
    const rows = await posgres("authors").select("*").whereIn("author_id", ids);

    // look up object
    const lookup = rows.reduce((acc, row) => {
      acc[row.author_id] = row;
      return acc;
    }, {});

    const a = ids.map((id) => {
      return lookup[id] || null;
    });

    return ids.map((id) => lookup[id] || null);
  }),
};
//
console.log(process.env);
const apolloServer = new ApolloServer({
  schema,
  context: async ({ req, res }) => {
    const token = req.cookies.token;
    if (!token) return { user: null, loader, res };
    const { user } = jwt.verify(token, process.env.TOKEY);
    console.log(user);
    if (!user) return { user: null, loader, res };

    // "refreshing" the cookie jwt
    // check if the token is about to expire in 60 seconds
    // if the user sent a request within the time frame, give them another cookie
    const now = Math.floor(Date.now() / 1000);
    if (user?.exp - now <= 60 && user?.exp - now >= 0) {
      console.log("uh oh. about to expire!");
      newCookie(user, res);
      // const token = jwt.sign(
      //   { userid: user.id, email: user.email, name: user.name },
      //   process.env.TOKEY,
      //   {
      //     expiresIn: "1h",
      //   }
      // );
      // res.setHeader(
      //   "Set-Cookie",
      //   cookie.serialize("token", token, {
      //     httpOnly: true,
      //     maxAge: ONE_HOUR,
      //     // secure: process.env.NODE_ENV === "production",
      //   })
      // );
    }
    return { user, loader, res };
  },
  introspection: true,
});

const startServer = apolloServer.start();

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  await startServer;
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
