import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";
import UserCard from "./UserCard";

const FetchUsers = () => {
  const GET_ALL_USERS = gql`
    query Query {
      getUsers {
        id
        name
        email
        role
        profile_image
      }
    }
  `;
  const { loading, error, data } = useQuery(GET_ALL_USERS);
  const [users, setUsers] = useState();
  useEffect(() => {
    setUsers(data?.getUsers);
  }, [data]);

  return (
    <div className="flex flex-col justify-center">
      {loading && <p>loading</p>}
      {error && <p>error {error.message}</p>}
      <h1 className="text-3xl font-bold mt-2 mx-4">USERS:</h1>
      <ul className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mx-4">
        {users &&
          users.map((user) => <UserCard key={user.email} user={user} />)}
      </ul>
    </div>
  );
};

export default FetchUsers;
