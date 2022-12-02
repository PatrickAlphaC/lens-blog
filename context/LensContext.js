import { createContext, useEffect, useState, useContext } from "react";
import {
  apolloClient,
  challenge,
  authenticate,
  getDefaultProfile,
} from "../constants/lensConstants";
import { ethers } from "ethers";
import { useMoralis } from "react-moralis";

export const LensContext = createContext();

export const useLensContext = () => {
  return useContext(LensContext);
};

export function LensProvider({ children }) {
  const [token, setToken] = useState();
  const [profileId, setProfileId] = useState();
  const { account } = useMoralis();

  const signIn = async () => {
    try {
      /* first request the challenge from the API server */
      const challengeInfo = await apolloClient.query({
        query: challenge,
        variables: { address: account },
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      /* ask the user to sign a message with the challenge info returned from the server */
      const signature = await signer.signMessage(
        challengeInfo.data.challenge.text
      );
      /* authenticate the user */
      const authData = await apolloClient.mutate({
        mutation: authenticate,
        variables: {
          address: account,
          signature,
        },
      });
      /* if user authentication is successful, you will receive an accessToken and refreshToken */
      const {
        data: {
          authenticate: { accessToken },
        },
      } = authData;

      setToken(accessToken);
    } catch (err) {
      console.log("Error signing in: ", err);
    }
  };

  const getProfileId = async () => {
    const defaultProfile = await apolloClient.query({
      query: getDefaultProfile,
      variables: {
        request: {
          ethereumAddress: account,
        },
      },
    });
    if (defaultProfile.data.defaultProfile)
      return defaultProfile.data.defaultProfile.id;

    return null;
  };

  useEffect(() => {
    const readToken = window.localStorage.getItem("lensToken");
    if (readToken) {
      setToken(readToken);
    }
    if (account && !token && !readToken) {
      signIn();
    }
    if (!account) {
      window.localStorage.removeItem("lensToken");
    }
    if (account) {
      getProfileId().then((id) => setProfileId(id));
    }
  }, [account]);

  useEffect(() => {
    if (token) {
      window.localStorage.setItem("lensToken", token);
    }
  }, [token]);

  return (
    <LensContext.Provider value={{ token, profileId }}>
      {children}
    </LensContext.Provider>
  );
}
