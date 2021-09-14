import BookCardLoading from "./Books";

const BookListLoading = () => {
  return (
    <>
      {Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9]).map((i) => (
        <BookCardLoading key={i} />
      ))}
    </>
  );
};

export default BookListLoading;
