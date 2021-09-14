import jwt from "jsonwebtoken";
import { posgres } from "../pages/api/graphql";
import randToken from "rand-token";
import cookie from "cookie";
import { authenticated } from "./auth";
import {
  comparePassword,
  encryptPassword,
  getNewInfo,
  newCookie,
} from "../utils";
import bcrypt from "bcrypt";

const getRefreshToken = () => {
  return randToken.uid(64);
};
const saveRefreshToken = async (refreshToken, user_id) => {
  try {
    const token = await posgres("tokens")
      .insert([{ refresh_token: refreshToken, user_id }])
      .returning("*");
    //   const addedUser = await posgres("people")
    //   .insert([{ name, email, password }])
    //   .returning("*");
    // return addedUser[0];
  } catch (error) {
    return error;
  }
};
// TODO: ADD A SORT FUNCTION (check getUsers for example)

export const EXPIRATION_DATE = Math.floor(Date.now() / 1000) + 60 * 60;
export const ONE_HOUR = 60 * 60;

export const resolvers = {
  Query: {
    me: async (_par, _args, { user }, _info) => {
      console.log(user);
      const currentUserId = user?.id;
      const me = await posgres("people")
        .select("*")
        .where({
          id: currentUserId,
        })
        .first();
      console.log("me", me);
      return me;
    },
    login: async (_par, { email, password }, { res }, _info) => {
      // console.log("parent", res);
      const user = await posgres("people")
        .select("*")
        .where({ email: email })
        .first();

      if (!user) throw new Error("User does not exist!");

      const match = await comparePassword(password, user.password);
      if (!match) throw new Error("Incorrect password!");

      newCookie(user, res);
      return user;
    },
    getUser: async (_par, args, _context, _info) => {
      console.log("context", _context.res.cookies);
      const user = await posgres("people")
        .select("*")
        .where({
          id: args.id,
        })
        .first();

      return user;
    },

    getUsers: async (_par, { sortField, sortDirection }, _context, _info) => {
      const field = sortField || "id";
      const direction = sortDirection || "asc";
      const users = await posgres("people")
        .select("*")
        .orderBy(field, direction);
      return users.map((user) => user);
    },

    getAuthors: async (_par, _args, _context, _info) => {
      const authors = await posgres("authors")
        .select("*")
        .orderBy("author_id", "asc");
      return authors.map((author) => author);
    },

    getBook: async (_par, args, _context, _info) => {
      const book = await posgres("books")
        .select("*")
        .where({ book_id: args.id })
        .first();
      return book;
    },
    getBooks: async (_par, _args, _context, _info) => {
      const books = await posgres("books")
        .select("*")
        .orderBy("book_id", "asc");
      return books.map((book) => book);
    },
    getBooksByAuthor: async (_par, args, _context, _info) => {
      const books = await posgres("books")
        .select("*")
        .whereRaw(`${args.id} = any(authors)`);

      return books.map((book) => book);
    },
    searchBooks: async (_par, { searchTerm }, _context, _info) => {
      const books = await posgres("books")
        .select("*")
        .joinRaw("join authors on authors.author_id = any(books.authors) ")
        .whereRaw(`authors.author_name like '%${searchTerm}%'`)
        .orWhereRaw(`books.title like '%${searchTerm}%'`)
        .orWhereRaw(`books.description like '%${searchTerm}%'`)
        .orderBy("books.book_id");
      return books.map((book) => book);
    },
  },
  Mutation: {
    signUp: async (
      _par,
      { input: { name, email, password } },
      { res },
      _info
    ) => {
      // check for empty fields
      if (!name || !email || !password)
        throw new Error("fields can't be empty");

      const exist = await posgres("people")
        .select("*")
        .where({
          email,
        })
        .first();

      if (exist) throw new Error(`Email is already in use.`);
      const hashedPassword = await encryptPassword(password);
      const signedUpUser = await posgres("people")
        .insert([{ name, email, password: hashedPassword, role: "user" }])
        .returning("*");

      const user = signedUpUser[0];
      newCookie(user, res);
      return user;
    },
    addUser: async (
      _par,
      { input: { name, email, password, role } },
      _context,
      _info
    ) => {
      const exist = await posgres("people")
        .select("*")
        .where({
          email,
        })
        .first();

      const hashedPassword = await encryptPassword(password);
      if (!role) role = "user";
      if (exist) throw new Error("email is already in use.");
      const addedUser = await posgres("people")
        .insert([{ name, email, password: hashedPassword, role }])
        .returning("*");
      return addedUser[0];
    },
    editUser: async (_par, { id, input }, _context, _info) => {
      const orginalUser = await posgres("people")
        .select("*")
        .where({
          id,
        })
        .first();

      // compare the input with the original
      const toBeUpdated = await getNewInfo(input, orginalUser);
      // if there's nothing to update, returns the original
      if (Object.keys(toBeUpdated).length === 0) return originalMe;

      const editedUser = await posgres("people")
        .where({ id })
        .update(toBeUpdated)
        .returning("*");
      return editedUser[0];
    },
    editMe: async (_par, { input }, { user }, _info) => {
      const originalMe = await posgres("people")
        .select("*")
        .where({
          id: user?.id,
        })
        .first();

      // compare the input with the original
      const toBeUpdated = await getNewInfo(input, originalMe);
      // if there's nothing to update, returns the original
      if (Object.keys(toBeUpdated).length === 0) return originalMe;

      // if there is, update
      const editedMe = await posgres("people")
        .where({ id: user?.id })
        .update(toBeUpdated)
        .returning("*");
      return editedMe[0];
    },
    addAuthor: async (_par, { name }, _context, _info) => {
      const addedAuthor = await posgres("authors")
        .insert([{ author_name: name }])
        .returning("*");
      return addedAuthor[0];
    },
    editAuthor: async (_par, { input: { id, name } }, _context, _info) => {
      const editedAuthor = await posgres("authors")
        .where({ author_id: id })
        .update({ author_name: name })
        .returning("*");
      return editedAuthor[0];
    },
    addBook: async (
      _par,
      {
        input: {
          title,
          published,
          page_count,
          authors,
          description,
          image_url,
        },
      },
      _context,
      _info
    ) => {
      const addedBook = await posgres("books")
        .insert([
          { title, published, page_count, authors, description, image_url },
        ])
        .returning("*");
      return addedBook[0];
    },
    editBook: async (_par, { id, input }, _context, _info) => {
      // fetch the original copy to compare
      const originalBook = await posgres("books")
        .select()
        .where({ book_id: id })
        .first();

      const toBeUpdated = {};

      Object.keys(input).map((inp) => {
        if (input[inp] !== originalBook[inp]) {
          toBeUpdated[inp] = input[inp];
        }
      });

      // if no change has been detected, return the orginal copy.
      if (!toBeUpdated || Object.keys(toBeUpdated).length === 0)
        return originalBook;

      const editedBook = await posgres("books")
        .where({ book_id: id })
        .update(toBeUpdated)
        .returning("*");
      return editedBook[0];
    },
    deleteUser: async (_par, args, _context, _info) => {
      const deletedUser = await posgres("people")
        .where({ id: args.userid })
        .del()
        .returning("*");
      const isDeleted = await Boolean(deletedUser.length);
      return { ok: isDeleted, deletedUser };
    },
    deleteBook: async (_par, args, _context, _info) => {
      const deletedBook = await posgres("books")
        .where({ id: args.bookid })
        .del()
        .returning("*");
      const isDeleted = await Boolean(deletedBook.length);
      return { ok: isDeleted, deletedBook };
    },
    deleteAuthor: async (_par, args, _context, _info) => {
      const deletedAuthor = await posgres("authors")
        .where({ author_id: args.authorid })
        .del()
        .returning("*");
      const isDeleted = await Boolean(deletedAuthor.length);
      return { ok: isDeleted, deletedAuthor };
    },
  },
  DeleteResponse: {
    ok: (response, _args, _context, _info) => response.ok,
    deletedUser: (response, _args, _context, _info) => response.deletedUser,
    deletedBook: (response, _args, _context, _info) => response.deletedBook,
    deletedAuthor: (response, _args, _context, _info) => response.deletedAuthor,
  },

  User: {
    id: (user, _args, _context, _info) => {
      return user.id;
    },
    name: async (user, _args, _context, _info) => user.name,
    email: async (user, _args, _context, _info) => user.email,
    role: async (user, _args, _context, _info) => user.role,
    profile_image: async (user, _args, _context, _info) => user.profile_image,
  },
  Book: {
    id: (book, _args, _context, _info) => book.book_id,
    title: (book, _args, _context, _info) => book.title,
    published: (book, _args, _context, _info) => book.published,
    page_count: (book, _args, _context, _info) => book.page_count,
    authors: async (book, _args, { loader }, _info) => {
      const authors = book.authors.map(async (authorid) => {
        return loader.authors.load(authorid);
      });
      return authors;
    },
    description: (book, _args, _context, _info) => book.description,
    image_url: (book, _args, _context, _info) => book.image_url,
  },
  Author: {
    id: (author, _args, _context, _info) => {
      return author.author_id;
    },
    name: (author, _args, _context, _info) => author.author_name,
  },
};
