import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { GetServerSideProps } from "next";
import { Link } from "../types/Link";
import { UserDetails } from "../types/UserDetails";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Navigation } from "../components/navigation";
import Image from "next/image";

const PublicProfile = ({
  userDetails,
  data,
}: {
  userDetails: UserDetails;
  data: Link[];
}) => {
  const myLoader = ({ src, width }) => {
    if (!userDetails) {
      return "https://via.placeholder.com/150";
    }
    const { publicURL, error } = supabaseClient.storage
      .from("avatars")
      .getPublicUrl(userDetails.avatar_url ?? "");
    return publicURL;
  };
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
export default PublicProfile;
