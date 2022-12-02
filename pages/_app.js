import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { MoralisProvider } from "react-moralis";
import { LensProvider } from "../context/LensContext";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "../constants/lensConstants";
import { NotificationProvider } from "@web3uikit/core";

function LensBlog({ Component, pageProps }) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <ApolloProvider client={apolloClient}>
        <LensProvider>
          <NotificationProvider>
            <Navbar />
            <Component {...pageProps} />
          </NotificationProvider>
        </LensProvider>
      </ApolloProvider>
    </MoralisProvider>
  );
}

export default LensBlog;
