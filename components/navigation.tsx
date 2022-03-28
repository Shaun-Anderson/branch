import Link from "next/link";
import Image from "next/image";
import { useUser } from "../utils/useUser";
import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ArrowLeftIcon, UserCircleIcon } from "@heroicons/react/solid";

export const Navigation = () => {
  const { user, userDetails } = useUser();
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
    <nav className="sticky backdrop-blur-sm bg-white/30 top-0  z-10 transition-all duration-150">
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex justify-between align-center flex-row py-4 md:py-6 relative">
          <div className="flex flex-1 justify-end space-x-8">
            {user ? (
              <>
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className="inline-flex transition-all ease-in-out rounded-full justify-center w-full text-sm font-medium text-white bg-black bg-opacity-20 hover:scale-105 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                      <Image
                        loader={myLoader}
                        src="me.png"
                        alt="Profile picture"
                        className="rounded-full  border-2 border-black border-solid object-cover"
                        width={38}
                        height={38}
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-1 py-1 ">
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="/me"
                              className={`${
                                active
                                  ? "bg-violet-500 text-white"
                                  : "text-gray-900"
                              } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                            >
                              <UserCircleIcon
                                className="w-4 h-4 mr-3"
                                aria-hidden="true"
                              />
                              Edit Profile
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="/api/auth/logout"
                              className={`${
                                active
                                  ? "bg-violet-500 text-white"
                                  : "text-gray-900"
                              } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                            >
                              <ArrowLeftIcon
                                className="w-4 h-4 mr-3"
                                aria-hidden="true"
                              />
                              Logout
                            </a>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
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
