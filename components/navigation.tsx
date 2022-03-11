import Link from "next/link";
import Image from "next/image";

import { useUser } from "../utils/useUser";
import { useRouter } from "next/router";
import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";

export const Navigation = () => {
  const { user, userDetails } = useUser();
  console.log(userDetails);
  const router = useRouter();
  const myLoader = ({ src, width }) => {
    if (!userDetails) {
      return "https://via.placeholder.com/150";
    }
    const { publicURL, error } = supabaseClient.storage
      .from("avatar")
      .getPublicUrl(
        userDetails.avatar_url ?? "https://via.placeholder.com/150"
      );
    return userDetails.avatar_url;
  };
  return (
    <nav className="sticky top-0  z-40 transition-all duration-150">
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex justify-between align-center flex-row py-4 md:py-6 relative">
          <div className="flex flex-1 justify-end space-x-8">
            {user ? (
              <>
                <img
                  src={userDetails?.avatar_url}
                  alt="Picture of the author"
                  className="rounded-full"
                  width={32}
                  height={32}
                />{" "}
                <Link href="/api/auth/logout">
                  <a className="inline-flex items-center leading-6 font-medium transition ease-in-out duration-75 cursor-pointer text-zinc-200 rounded-md p-">
                    Sign out
                  </a>
                </Link>
              </>
            ) : (
              <Link href="/signin">
                <a className="inline-flex items-center leading-6 font-medium transition ease-in-out duration-75 cursor-pointer text-zinc-200 rounded-md p-">
                  Sign in
                </a>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
