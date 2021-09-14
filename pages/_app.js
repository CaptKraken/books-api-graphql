import { useRouter } from "next/dist/client/router";
import { IntlProvider } from "react-intl";
import "tailwindcss/tailwind.css";
import { AuthProvider } from "./AuthContext";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
const messages = {
  en: { hello: "Hello" },
  km: { hello: "សួរស្ដី" },
  es: { hello: "Hola" },
};

const onError = (err) => {
  // console.log(err);
};

const client = new ApolloClient({
  uri: "http://localhost:3000/api/graphql",
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }) {
  const { locale } = useRouter();

  return (
    <IntlProvider locale={locale} onError={onError} messages={messages[locale]}>
      <ApolloProvider client={client}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ApolloProvider>
    </IntlProvider>
  );
}

export default MyApp;
