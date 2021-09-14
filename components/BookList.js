import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";
import BookCard from "./BookCard";

const BookList = () => {
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
  const { loading, error, data } = useQuery(GET_ALL_BOOKS);
  const [books, setBooks] = useState();
  useEffect(() => {
    setBooks(data?.books);
  }, [data]);

  return (
    <div className={`mt-4 flex flex-col justify-center`}>
      {loading && <p>loading</p>}
      {error && <p>error {error.message}</p>}
      <h1 className="text-3xl font-bold mt-2">BOOKS:</h1>
      <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {books && books.map((book) => <BookCard key={book.id} book={book} />)}
      </ul>
    </div>
  );
};

export default BookList;
