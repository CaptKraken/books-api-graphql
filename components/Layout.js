import Head from "next/head";
import Header from "./Header";

const Layout = ({ children, title }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="min-h-screen py-4 bg-gray-100">
        <Header />
        <main className="my-4 px-4 md:max-w-5xl lg:max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </>
  );
};

Layout.defaultProps = {
  title: "what's up?",
};

export default Layout;
