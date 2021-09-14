import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";

const AuthorsList = () => {
  const GET_ALL_AUTHORS = gql`
    query Query {
      authors: getAuthors {
        id
        name
      }
    }
  `;
  const { loading, error, data } = useQuery(GET_ALL_AUTHORS);
  const [authors, setAuthors] = useState();
  useEffect(() => {
    setAuthors(data?.authors);
  }, [data]);

  return (
    <div className={`mt-4 flex flex-col justify-center`}>
      {loading && <p>loading</p>}
      {error && <p>error {error.message}</p>}
      <h1 className="text-3xl font-bold mt-2">AUTHORS:</h1>
      <ul className="mt-4 flex flex-wrap gap-2 text-white">
        {authors &&
          authors.map((author) => (
            <li key={author.id} className="bg-green-400 px-2 rounded">
              <a href="#" className="hover:underline">
                {author.name}
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default AuthorsList;
