import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, FormEvent } from "react";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";

import Input from "../components/Input";
import Button from "../components/Button";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      router.replace("/me");
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
                type="password"
                placeholder="Password"
                value={password}
                onChange={setPassword}
                required
              />
              <Button
                type="submit"
                loading={loading}
                label="Sign in"
                loadingText="Signing in..."
                disabled={!password.length || !email.length}
              />
            </form>

            <span className="pt-1 text-center text-sm">
              <span className="text-gray-800">Don&apos;t have an account?</span>
              {` `}
              <Link href="/signup">
                <a className="text-accent-9 font-bold hover:underline cursor-pointer ml-2">
                  Sign up.
                </a>
              </Link>
            </span>
          </div>
        </div>
      </div>
    );

  return <div className="m-6">Loading</div>;
};

export default SignIn;
