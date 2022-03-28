import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { GetServerSideProps } from "next";
import { Link } from "../types/Link";
import { UserDetails } from "../types/UserDetails";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Navigation } from "../components/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { colorScheme } from "../utils/colorSchemes";

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const { username } = params;
  console.log(username);

  // user details
  const userDetails = await supabaseClient
    .from<UserDetails>("profiles")
    .select("*")
    .eq("username", username)
    .single();
  console.log(userDetails.data);
  if (!userDetails.data) {
    return {
      redirect: {
        destination: "/noUserFound",
        permanent: false,
      },
    };
  }
  // links
  const links = await supabaseClient
    .from<Link>("links")
    .select("*")
    .eq("user_id", userDetails.data.id)
    .order("order");
  return { props: { userDetails: userDetails.data, data: links.data } };
};

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
    <div className={Object.values(colorScheme)[0]}>
      <Navigation />
      <div className={styles.container}>
        <Head>
          <title>{userDetails.username}'s Links</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>
        <main className={styles.main}>
          <Image
            loader={myLoader}
            src="me.png"
            alt="Profile picture"
            className="rounded-full  border-2 border-black border-solid object-cover"
            width={100}
            height={100}
          />
          <h1 className="text-3xl font-bold mt-5">@{userDetails?.username}</h1>
          <p className=" max-w-xl w-full text-sm text-center my-4 p-2 rounded-lg text-black opacity-50">
            {userDetails?.bio}
          </p>
          {data.map((item: Link, index: number) => (
            <div style={{ width: "100%", maxWidth: "500px" }}>
              <div className="flex">
                <a
                  href={item.url}
                  className="transition ease-in-out my-1 flex-grow max-w-full p-3 bg-stone-50  rounded-md flex items-center"
                >
                  <FontAwesomeIcon icon={faFacebook} />

                  <div className="ml-5">
                    <h2 className="text-md">{item.title}</h2>
                  </div>
                </a>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};
export default PublicProfile;
