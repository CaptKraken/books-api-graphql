import Link from "next/link";

const Header = () => {
  return (
    <header className="my-4 px-4 md:max-w-5xl lg:max-w-7xl mx-auto flex items-center justify-between">
      <h1 className="text-4xl">INTERNAL BOOKS</h1>
      <div>
        <Link href="/">Books</Link>
      </div>
    </header>
  );
};

export default Header;
