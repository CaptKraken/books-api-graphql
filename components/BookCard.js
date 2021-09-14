import Image from "next/image";
import Link from "next/link";
import style from "../styles/BookCard.module.css";
const BookCard = ({ book }) => {
  return (
    <li>
      <Link href={`/books/${book.id}`}>
        <a
          className={`bg-green-50 rounded-md overflow-hidden flex flex-col h-full relative ${style.bookCard}`}
        >
          <img
            src={book.image_url}
            className="object-cover w-full"
            style={{ height: "450px" }}
          />
          <div className="px-2 flex flex-col gap-2 justify-end py-4 absolute bottom-0 w-full bg-gradient-to-t text-gray-100 from-green-600 h-48">
            <h3 className="font-bold truncate">{book.title}</h3>
            <div className="flex gap-1">
              {book.authors.map((author) => (
                <Link
                  key={author.id}
                  href={`/authors/${author.id}`}
                  className="font-bold bg-green-500 hover:bg-green-400 rounded px-1 text-sm max-w-max"
                >
                  {author.name}
                </Link>
              ))}
            </div>
          </div>
        </a>
      </Link>
    </li>
  );
};

export default BookCard;
