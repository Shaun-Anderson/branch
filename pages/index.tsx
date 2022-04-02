// import { Navigation } from "@/components/Navigation";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Branch</title>
        <meta name="description" content="Branch" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* <Navigation /> */}

      <main className={styles.main}>
        <section>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Welcome to Branch
          </h1>
          <p className="text-md text-gray-500 mt-2">
            Your hub for your online presence.
          </p>
          <div className="flex justify-center items-center">
            <Link href={"/signup"} passHref>
              <a className=" transition-all ease-in-out px-5 py-3 font-semibold shadow-md rounded-lg my-10 bg-black text-white hover:scale-105">
                Sign up
              </a>
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p className="text-xs">Created by Shaun Anderson</p>
      </footer>
    </div>
  );
};

export default Home;
