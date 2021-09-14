import ContentLoader from "react-content-loader";

const BookCardLoading = () => {
  return (
    <ContentLoader
      id="loading"
      speed={3}
      width={290}
      height={450}
      viewBox="0 0 290 460"
    >
      {/* Only SVG shapes */}
      <rect x="0" y="0" rx="5" ry="5" width="100%" height="100%" />
    </ContentLoader>
  );
};

export default BookCardLoading;
