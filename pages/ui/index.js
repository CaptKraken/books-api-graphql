import AuthorsList from "../../components/AuthorsList";
import BookList from "../../components/BookList";
import FetchUsers from "../../components/FetchUsers";

const Home = () => {
  return (
    <div className="my-4">
      <FetchUsers />
      <div className="flex gap-4 flex-col px-4 lg:flex-row">
        <div style={{ flex: "70%" }}>
          <BookList />
        </div>
        <div style={{ flex: "20%" }}>
          <AuthorsList />
        </div>
      </div>
    </div>
  );
};

export default Home;
