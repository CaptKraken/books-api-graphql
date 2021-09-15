import { useRouter } from "next/dist/client/router";
import { IntlProvider } from "react-intl";
import "tailwindcss/tailwind.css";
import { AuthProvider } from "../context/AuthContext";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import Layout from "../components/Layout";
const messages = {
  en: { hello: "Hello" },
  km: { hello: "សួរស្ដី" },
  es: { hello: "Hola" },
};
import "../styles/global.css";
import { API_URL } from "../destination";

const onError = (err) => {
  // console.log(err);
};

const client = new ApolloClient({
  uri: API_URL,
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }) {
  const { locale } = useRouter();

  return (
    <IntlProvider locale={locale} onError={onError} messages={messages[locale]}>
      <ApolloProvider client={client}>
        <AuthProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AuthProvider>
      </ApolloProvider>
    </IntlProvider>
  );
}

export default MyApp;
