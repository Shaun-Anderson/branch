import { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Navigation } from "../components/Navigation";

const UserNotFound: NextPage = () => {
  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <Head>
          <title>No user found.</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>
        <main className={styles.main}>
          <p>Oops. There is no user with this username</p>
        </main>
      </div>
    </>
  );
};
export default UserNotFound;
