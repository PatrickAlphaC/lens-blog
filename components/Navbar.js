import Link from "next/link";
import { ConnectButton } from "@web3uikit/web3";
import { useMoralis } from "react-moralis";
import { useState } from "react";

// Top navbar
export default function Navbar() {
  const { account } = useMoralis();

  return (
    <nav className="pt-5 pb-5 pr-10 pl-10 h-70 w-full bg-white fixed top-0 p-0 font-bold border-b-2 border-solid border-black z-99">
      <ul className="list-none m-0 p-0 flex items-center justify-between h-full">
        <li className="rounded">
          <Link href="/">
            <img
              className="rounded-t-lg"
              src="logo-full-black.svg"
              alt=""
              width={220}
            />
          </Link>
        </li>

        {account && (
          <>
            <li>
              <Link href="/write-blog">
                <div className="flex space-x-2 justify-center">
                  <button
                    type="button"
                    className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                  >
                    Write Blog
                  </button>
                </div>
              </Link>
            </li>
          </>
        )}

        <li>
          <ConnectButton moralisAuth={false} />
        </li>
      </ul>
    </nav>
  );
}
