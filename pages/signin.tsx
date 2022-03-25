import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, FormEvent } from "react";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";

import { Provider } from "@supabase/supabase-js";
import { getURL } from "../utils/helpers";
import Input from "../components/Input";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type?: string; content?: string }>({
    type: "",
    content: "",
  });
  const router = useRouter();
  const { user } = useUser();

  const handleSignin = async (e: FormEvent<HTMLFormElement>) => {
    console.log("SIGNING IN");
    e.preventDefault();

    setLoading(true);
    setMessage({});

    const { error, user } = await supabaseClient.auth.signIn(
      { email, password },
      { redirectTo: "http://localhost:3000" }
    );
    console.log(user);
    if (error) {
      setMessage({ type: "error", content: error.message });
    }
    if (!password) {
      setMessage({
        type: "note",
        content: "Check your email for the magic link.",
      });
    }
    setLoading(false);
  };

  const handleOAuthSignIn = async (provider: Provider) => {
    setLoading(true);
    const { error } = await supabaseClient.auth.signIn({ provider });
    if (error) {
      setMessage({ type: "error", content: error.message });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      router.replace("/account");
    }
  }, [user]);

  if (!user)
    return (
      <div className="flex justify-center height-screen-helper h-full">
        <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
          <div className="flex justify-center pb-12 ">
            {/* <Logo width="64px" height="64px" /> */}
          </div>
          <div className="flex flex-col space-y-4">
            {message.content && (
              <div
                className={`${
                  message.type === "error" ? "text-pink-500" : "text-green-500"
                } rounded text-sm ${
                  message.type === "error" ? "bg-pink-100" : "bg-green-100"
                } p-3`}
              >
                {message.content}
              </div>
            )}

            {!showPasswordInput && (
              <form onSubmit={handleSignin} className="flex flex-col space-y-4">
                <Input
                  label={"Email"}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={setEmail}
                  required
                />
                <button
                  className="bg-white text-zinc-800 cursor-pointer inline-flex px-10 rounded-sm leading-6  transition ease-in-out duration-150 shadow-sm font-semibold text-center justify-center uppercase py-4 border border-transparent items-center hover:bg-zinc-800 hover:text-white hover:border hover:border-white"
                  // variant="slim"
                  type="submit"
                  // loading={loading}
                  disabled={!email.length}
                >
                  Send magic link
                </button>
              </form>
            )}

            {showPasswordInput && (
              <form onSubmit={handleSignin} className="flex flex-col space-y-4">
                <Input
                  label={"Email"}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={setEmail}
                  required
                />
                <Input
                  label={"Password"}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={setPassword}
                  required
                />
                <button
                  className="mt-1 rounded p-2 bg-indigo-500 text-white cursor-pointer"
                  // variant="slim"
                  type="submit"
                  // loading={loading}
                  disabled={!password.length || !email.length}
                >
                  Sign in
                </button>
              </form>
            )}

            <span className="pt-1 text-center text-sm">
              <a
                href="#"
                className="text-gray-500 text-accent-9 hover:underline cursor-pointer"
                onClick={() => {
                  if (showPasswordInput) setPassword("");
                  setShowPasswordInput(!showPasswordInput);
                  setMessage({});
                }}
              >
                {`Or sign in with ${
                  showPasswordInput ? "magic link" : "password"
                }.`}
              </a>
            </span>

            <span className="pt-1 text-center text-sm">
              <span className="text-gray-500">Don't have an account?</span>
              {` `}
              <Link href="/signup">
                <a className="text-accent-9 font-bold hover:underline cursor-pointer">
                  Sign up.
                </a>
              </Link>
            </span>
          </div>

          <div className="flex items-center my-6">
            <div
              className="border-t border-zinc-600 flex-grow mr-3"
              aria-hidden="true"
            ></div>
            <div className="text-zinc-400">Or</div>
            <div
              className="border-t border-zinc-600 flex-grow ml-3"
              aria-hidden="true"
            ></div>
          </div>

          <button
            // variant="slim"
            type="submit"
            disabled={loading}
            onClick={() => handleOAuthSignIn("github")}
          >
            {/* <GitHub /> */}
            <span className="ml-2">Continue with GitHub</span>
          </button>
        </div>
      </div>
    );

  return <div className="m-6">Loading</div>;
};

export default SignIn;
