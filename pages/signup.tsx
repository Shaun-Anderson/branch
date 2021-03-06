import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, FormEvent } from "react";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";

import Input from "../components/Input";
import { User } from "@supabase/gotrue-js";
import { UserDetails } from "../types/UserDetails";
import Button from "@/components/Button";

const SignUp = () => {
  const [newUser, setNewUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type?: string; content?: string }>({
    type: "",
    content: "",
  });
  const router = useRouter();
  const { user } = useUser();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage({});
    const { error, user: createdUser } = await supabaseClient.auth.signUp(
      {
        email,
        password,
      },
      {
        data: {
          user_name: name,
        },
      }
    );
    if (error) {
      setMessage({ type: "error", content: error.message });
    } else {
      if (createdUser) {
        await supabaseClient
          .from<UserDetails>("users")
          .update({
            username: name,
          })
          .eq("id", createdUser.id);
        console.log(createdUser);
        setNewUser(createdUser);
      } else {
        setMessage({
          type: "note",
          content: "Check your email for the confirmation link.",
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (newUser || user) {
      router.replace("/me");
    }
  }, [newUser, user]);

  return (
    <div className="flex justify-center height-screen-helper h-full">
      <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
        <div className="flex justify-center pb-12 ">
          {/* <Logo width="64px" height="64px" /> */}
        </div>
        <form onSubmit={handleSignup} className="flex flex-col space-y-4">
          {message.content && (
            <div
              className={`${
                message.type === "error" ? "text-pink-500" : "text-green-500"
              } border ${
                message.type === "error"
                  ? "border-pink-500"
                  : "border-green-500"
              } p-3`}
            >
              {message.content}
            </div>
          )}
          <Input label="" placeholder="Name" onChange={setName} />
          <Input
            label=""
            type="email"
            placeholder="Email"
            onChange={setEmail}
            required
          />
          <Input
            label=""
            type="password"
            placeholder="Password"
            onChange={setPassword}
          />
          <div className="pt-2 w-full flex flex-col">
            <Button
              type="submit"
              loading={loading}
              label="Sign up"
              loadingText="Signing you up..."
              disabled={!password.length || !email.length || !name.length}
            />
          </div>

          <span className="pt-1 text-center text-sm">
            <span className="text-zinc-500">Do you have an account?</span>
            {` `}
            <Link href="/signin">
              <a className="text-accent-9 font-bold hover:underline cursor-pointer">
                Sign in.
              </a>
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
