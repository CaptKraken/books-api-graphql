import { useRouter } from "next/dist/client/router";
import Head from "next/head";
import Link from "next/link";
import { useIntl } from "react-intl";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { data } from "autoprefixer";
const loadData = async (locale) => {
  const res = await fetch(`/api/hello`, {
    headers: {
      "Accept-Language": locale,
    },
  });
  const data = res.json();
  return data;
};

export default function Home() {
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const { isAuthenticated, login, logout, signup, currentUser } =
    useContext(AuthContext);

  const { locale, locales } = useRouter();
  // const { data } = useSWR([locale, "hello"], loadData);
  const { formatMessage: f } = useIntl();

  useEffect(() => {
    console.log("currentUser", currentUser);
  }, [currentUser]);

  const handleDelete = async (id) => {
    const res = await fetch(`http://localhost:3000/api/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
      mutation Mutation {
        deleteUser(userid: ${id}) {
          ok
          deletedUser {
            id
            name
            email
          }
        }
      }
    `,
      }),
    });
    const {
      data: { deleteUser },
    } = await res.json();
    console.log(deleteUser.ok, deleteUser.deletedUser[0]);
  };

  const handleFetchUsers = async () => {
    const res = await fetch(`http://localhost:3000/api/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: currentUser.token ? `Bearer ${currentUser.token}` : "",
      },
      body: JSON.stringify({
        query: `
        query Query {
          users: getUsers {
            id
            name
            email
          }
        }
      `,
      }),
    });

    try {
      const { data, errors } = await res.json();
      if (errors) {
        errors.map((error) => {
          if (error.message.includes("jwt expired")) {
            console.log("ERROR: Please login again.");
            // probably need to redirect after logging user out
            return logout();
          }

          // might wanna find a more graceful way to handle the error later lol
          setError(error.message.replace("Context creation failed: ", ""));
          return console.log(
            "error",
            error.message.replace("Context creation failed: ", "")
          );
        });
      }

      setUsers(data?.users || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log(login);
    // signup(name, email, password);
    login(email, password);
    // const data = await res.json();

    // const { login } = data.data;
    // res.setHeader(
    //   "Set-Cookie",
    //   cookie.serialize("token", data.jwt, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV !== "development",
    //     maxAge: 60 * 60 * 24 * 7, // 1 week
    //     sameSite: "strict",
    //     path: "/",
    //   })
    // );
    // console.log(login);
  };

  return (
    <div className="mx-auto max-w-7xl text-center">
      {/* <h1>{isAuthenticated ? "IS LOGGED IN AS: " : null}</h1> */}
      {isAuthenticated && currentUser && <p>{currentUser?.user?.name}</p>}
      <p>locale: {locale}</p>
      <ul>
        {locales.map((loc, i) => (
          <li key={i} className="my-2">
            <Link href={`/`} locale={loc}>
              <a className="bg-green-300 hover:bg-green-400 px-3 py-1 rounded-md">
                {loc}
              </a>
            </Link>
          </li>
        ))}
      </ul>
      {error && <p>ERROR: {error}</p>}
      <form
        className="flex flex-col gap-4 max-w-xl mx-auto bg-green-200 p-4"
        onSubmit={handleSubmit}
      >
        <input type="text" onChange={(e) => setname(e.target.value)} />
        <input type="text" onChange={(e) => setemail(e.target.value)} />
        <input type="password" onChange={(e) => setpassword(e.target.value)} />
        <input type="submit" value="submit" />
      </form>

      <h3>Users</h3>
      <button
        className="bg-green-300 px-3 hover:bg-green-400"
        onClick={handleFetchUsers}
      >
        fetch User
      </button>
      {users.length === 0 && <p>NO USER FOUND</p>}
      <ul>
        {users?.map((user) => (
          <li
            key={user.id}
            className="flex gap-4"
            onDoubleClick={() => handleDelete(user.id)}
          >
            <span>{user.id}</span>
            <span>{user.name}</span>
            <span>{user.email}</span>
          </li>
        ))}
      </ul>
      <h1 className="text-center text-5xl">{f({ id: "hello" })}</h1>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
    </div>
  );
}

// export async function getServerSideProps() {

//   return {
//     props: { data },
//   };
// }
