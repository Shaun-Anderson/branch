import "../styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "@supabase/supabase-auth-helpers/react";
import { MyUserContextProvider } from "../utils/useUser";
import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider supabaseClient={supabaseClient}>
      <MyUserContextProvider supabaseClient={supabaseClient}>
        <Component {...pageProps} />
      </MyUserContextProvider>
    </UserProvider>
  );
}

export default MyApp;
