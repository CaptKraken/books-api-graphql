import { BookOpenIcon, UserIcon, EyeIcon } from "@heroicons/react/outline";
import Image from "next/image";
import Link from "next/link";
import parse from "html-react-parser";

const BookPage = ({ book }) => {
  console.log(book);
  return (
    <div className="flex gap-6 mt-6 flex-col md:flex-row justify-start md:items-start">
      <h2 className="block text-3xl md:hidden">{book.title}</h2>
      <div className="flex md:hidden gap-4">
        <div className="flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-green-600" />
          {book.authors.map((author, i) => (
            <Link key={author.id} href={`/authors/${author.id}`}>
              {`${author.name}${i === book.authors.length - 1 ? "" : ","}`}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <EyeIcon className="w-5 h-5 text-green-600" />
          <span>{book.published}</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpenIcon className="w-5 h-5 text-green-600" />
          <span>{book.page_count}</span>
        </div>
      </div>
      <div style={{ flex: "80%" }} className="flex">
        {book?.image_url && (
          <div className="block w-full self-center">
            <Image
              src={book.image_url}
              width={1200}
              height={1800}
              layout="responsive"
            />
          </div>
        )}
      </div>
      <div style={{ flex: "100%" }}>
        <h2 className="hidden text-3xl md:block">{book.title}</h2>
        <div className="hidden md:mt-2 md:flex md:gap-4 ">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-green-600" />
            {book.authors.map((author, i) => (
              <Link key={author.id} href={`/authors/${author.id}`}>
                {`${author.name}${i === book.authors.length - 1 ? "" : ","}`}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <EyeIcon className="w-5 h-5 text-green-600" />
            <span>{book.published}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5 text-green-600" />
            <span>{book.page_count}</span>
          </div>
        </div>
        {book?.description && <p>{parse(book.description)}</p>}
      </div>
    </div>
  );
};

export default BookPage;

export async function getServerSideProps({ query: { id } }) {
  const res = await fetch(process.env.API_LINK, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      query Query($getBookId: Int) {
        book:getBook(id: $getBookId) {
          authors {
            id
            name
          }
          description
          id
          image_url
          page_count
          published
          title
        }
      }
    `,
      variables: {
        getBookId: Number(id),
      },
    }),
  });
  const {
    data: { book },
  } = await res.json();

  return {
    props: { book },
  };
}
