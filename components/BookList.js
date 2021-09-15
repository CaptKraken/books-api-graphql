import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";
import { API_URL } from "../destination";
import BookCard from "./BookCard";
import BookListLoading from "./skeletons/BookList";
const GET_ALL_BOOKS = gql`
  query Query {
    books: getBooks {
      id
      title
      published
      image_url
      authors {
        id
        name
      }
    }
  }
`;
const BookList = () => {
  const [books, setBooks] = useState();
  useEffect(() => {
    const books = async () => {
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
          query Query {
            books: getBooks {
              id
              title
              published
              image_url
              authors {
                id
                name
              }
            }
          }
      `,
        }),
      });
      const {
        data: { books },
      } = await res.json();
      setBooks(books);
      console.log("hi");
      console.log(books);
    };

    books();
  }, []);

  // const { loading, error, data } = useQuery(GET_ALL_BOOKS);

  // useEffect(() => {
  //   console.log(data);
  //   setBooks(data.books);
  // }, [data]);
  return (
    <div className={`mt-4 flex flex-col justify-center`}>
      {/* {loading && <p>loading</p>} */}
      {/* {error && <p>error {error.message}</p>} */}
      <h1 className="text-3xl font-bold mt-2">BOOKS:</h1>
      <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {!books && <BookListLoading />}
        {books && books.map((book) => <BookCard key={book.id} book={book} />)}
      </ul>
    </div>
  );
};

export default BookList;
