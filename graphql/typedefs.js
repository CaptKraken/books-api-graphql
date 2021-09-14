import { gql } from "apollo-server-micro";

export const typeDefs = gql`
  directive @isCurrentUser on FIELD_DEFINITION # not sure if i need this tho. only people there's no data privatization (maybe a book list next time?)
  directive @authenticated on FIELD_DEFINITION
  directive @permission(role: String) on FIELD_DEFINITION

  type Query {
    me: User! @authenticated
    login(email: String!, password: String!): User
    getUser(id: Int = 1): User
    getUsers(sortField: String, sortDirection: String): [User]!
    getAuthors: [Author]
    getBook(id: Int = 1): Book
    getBooks: [Book]
    getBooksByAuthor(id: Int = 1): [Book]
    searchBooks(searchTerm: String): [Book]
  }

  type Mutation {
    signUp(input: UserInput!): User
    addUser(input: UserInput!): User @permission(role: "admin")
    addAuthor(name: String!): Author @authenticated @permission(role: "editor")
    editBook(id: ID!, input: BookInput): Book @permission(role: "editor")
    editUser(id: ID!, input: UserEdit!): User @permission(role: "admin")
    editMe(input: UserEdit!): User @authenticated
    editAuthor(input: EditAuthor): Author @permission(role: "editor")
    addBook(input: BookInput): Book @permission(role: "editor")
    deleteUser(userid: Int!): DeleteResponse! @permission(role: "admin")
    deleteBook(bookid: Int!): DeleteResponse! @permission(role: "editor")
    deleteAuthor(authorid: Int!): DeleteResponse! @permission(role: "editor")
  }

  input EditAuthor {
    id: ID!
    name: String!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    role: String
  }
  input UserEdit {
    name: String
    email: String
    password: String
    role: String
  }

  input BookInput {
    title: String!
    published: Int
    page_count: Int
    authors: [Int]
    description: String
    image_url: String
  }

  type DeleteResponse {
    ok: Boolean!
    deletedUser: [User]
    deletedBook: [Book]
    deletedAuthor: [Author]
  }

  type User {
    id: ID
    name: String
    email: String
    role: String
    profile_image: String
  }

  type Book {
    id: ID
    title: String!
    published: Int
    page_count: Int
    authors: [Author]
    description: String
    image_url: String
  }

  type Author {
    id: ID
    name: String
  }
`;
