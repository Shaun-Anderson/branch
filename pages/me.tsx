import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { DropResult, resetServerContext } from "react-beautiful-dnd";
import { Fragment, useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "../components/dnd";
import {
  supabaseClient,
  User,
  withAuthRequired,
} from "@supabase/supabase-auth-helpers/nextjs";
import Avatar from "../components/avatar/Avatar";
import { LinkForm } from "../components/LinkForm";
import Drawer from "../components/drawer/Drawer";
import { Link } from "../types/Link";
import { UserDetails } from "../types/UserDetails";
import { colorScheme as colorSchemeEnum } from "../utils/colorSchemes";
import {
  CogIcon,
  PencilAltIcon,
  PlusIcon,
  SelectorIcon,
  TrashIcon,
  XIcon,
} from "@heroicons/react/solid";
import RadioGroup from "../components/RadioGroup";
import { Dialog, Transition } from "@headlessui/react";

export const _getServerSideProps: GetServerSideProps = async ({ req }) => {
  resetServerContext();
  const { user, token } = await supabaseClient.auth.api.getUserByCookie(req);
  supabaseClient.auth.setAuth(token as string);
  // links
  const getLinks = supabaseClient
    .from<Link>("links")
    .select("*")
    .order("order");
  // user details
  const getUserDetails = supabaseClient
    .from<UserDetails>("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  let [r1, r2] = await Promise.all([getUserDetails, getLinks]);
  return { props: { userDetails: r1.data, data: r2.data } };
};

export const getServerSideProps = withAuthRequired({
  getServerSideProps: _getServerSideProps,
  redirectTo: "/signin",
});

const reorder = (
  list: Item[],
  startIndex: number,
  endIndex: number
): Item[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const Me: NextPage = ({
  user,
  userDetails,
  data,
}: {
  user: User;
  userDetails: UserDetails;
  data: Link[];
}) => {
  const [links, setLinks] = useState<Link[]>(data);

  const [selectedLink, setSelectedLink] = useState<Link | undefined>(undefined);
  const [colorScheme, setColorScheme] = useState(userDetails.colorScheme);
  const [avatar_url, setAvatarUrl] = useState(userDetails.avatar_url);
  const [loading, setLoading] = useState(false);

  // Settings State
  let [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [username, setUsername] = useState(userDetails.username);
  const [bio, setBio] = useState(userDetails.bio);

  // Add State
  let [isAddOpen, setIsAddOpen] = useState(false);

  // Edit State
  let [isEditOpen, setIsEditOpen] = useState(false);

  // Delete State
  let [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteLink = async (id: string) => {
    const { data, error } = await supabaseClient
      .from<Link>("links")
      .delete()
      .match({ id });
    if (!error) {
      fetchLinks();
      setIsDeleteOpen(false);
    }
  };

  const myLoader = ({ src, width }) => {
    return `https://via.placeholder.com/${width}`;
  };
  console.log(userDetails.colorScheme);
  const fetchLinks = () => {
    supabaseClient
      .from<Link>("links")
      .select("*")
      .order("id", { ascending: false })
      .then(({ data, error }) => {
        console.log(error);
        console.log(data);
        if (!error) {
          setLinks(data ?? []);
        }
      });
  };

  useEffect(() => {
    setAvatarUrl(userDetails?.avatar_url);
  }, [userDetails]);

  const onDragEnd = async (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    // instance old links for use in error later
    const oldLinks = links;
    // reorder links
    const items: Link[] = reorder(
      links,
      result.source.index,
      result.destination.index
    );
    // map new items to ensure order is correct
    const newItems = items.map((item: Link, index: number) => {
      const updated = { ...item, order: index + 1 };
      return updated;
    });
    // update local states as we assume it will update without issue
    setLinks(items);
    // update order in supabase
    const { error } = await supabaseClient.from("links").upsert(
      newItems.map((item) => {
        return { id: item.id, order: item.order, user_id: item.user_id };
      })
    );
    // on error reset to old positions
    if (error) {
      setLinks(oldLinks);
    }
  };

  const colorSchemeRadioHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setColorScheme(event.target.value);
  };

  async function updateProfile({
    username,
    avatar_url,
    colorScheme,
  }: UserDetails) {
    try {
      setLoading(true);
      // const user = supabaseClient.auth.user();
      console.log("Upsert");
      console.log(user);
      const updates = {
        id: user?.id,
        username,
        avatar_url,
        colorScheme,
        updated_at: new Date(),
      };

      let { error } = await supabaseClient.from("profiles").upsert(updates, {
        returning: "minimal", // Don't return the value after inserting
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${Object.values(colorSchemeEnum)[colorScheme]}`}>
      <div className={styles.container}>
        <Head>
          <title>My Profile</title>
          <meta name="description" content="Customise you branches" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.main}>
          <Avatar
            url={avatar_url}
            size={100}
            onUpload={(url) => {
              setAvatarUrl(url);
              updateProfile({ username, avatar_url: url });
            }}
          />
          <h1 className="text-3xl font-bold mt-5">@{userDetails?.username}</h1>
          <p className=" max-w-xl w-full text-sm text-center my-4 p-2 rounded-lg whitespace-pre-line">
            {bio}
          </p>
          <div className=" w-full justify-center flex space-x-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className=" transition flex items-center  text-bold my-2 ease-in-out rounded-md bg-teal-50 py-2 px-3  text-teal-500 hover:bg-teal-100"
            >
              <PlusIcon
                className="w-5 h-5 sm:w-4 sm:h-4 mr-2 "
                aria-hidden="true"
              />
              New link
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className=" transition my-2 flex items-center ease-in-out rounded-md bg-indigo-50 py-2 px-3  text-indigo-500 hover:bg-indigo-100"
            >
              <CogIcon
                className="mr-2 w-5 h-5 sm:w-4 sm:h-4 "
                aria-hidden="true"
              />
              Settings
            </button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot): JSX.Element => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ width: "100%", maxWidth: "800px" }}
                  // style={getListStyle(snapshot.isDraggingOver)}
                >
                  {links.map((item: Link, index: number) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id as string}
                      index={index}
                    >
                      {(provided, snapshot): JSX.Element => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex space-x-2"
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="flex items-center justify-center mr-5"
                          >
                            <SelectorIcon
                              className="w-5 h-5 text-black-900 opacity-50"
                              aria-hidden="true"
                            />
                          </div>
                          <a
                            href={item.url}
                            className="transition justify-center ease-in-out my-1 flex-grow max-w-full p-3 bg-stone-50 rounded-md flex items-center"
                          >
                            <h2 className="text-md">{item.title}</h2>
                          </a>
                          <div className="align-center my-1 flex space-x-2">
                            <button
                              className=" flex justify-center items-center p-2 self-center rounded-md bg-amber-50 hover:bg-amber-100"
                              onClick={() => {
                                setSelectedLink(item);
                                setIsEditOpen(true);
                              }}
                            >
                              <PencilAltIcon
                                className="w-5 h-5 sm:w-4 sm:h-4  text-amber-400"
                                aria-hidden="true"
                              />
                            </button>
                            <button
                              className="  p-2 flex justify-center items-center self-center rounded-md  bg-red-50 hover:bg-red-100"
                              onClick={() => {
                                setSelectedLink(item);
                                setIsDeleteOpen(true);
                              }}
                            >
                              <TrashIcon
                                className="w-5 h-5 sm:w-4 sm:h-4 text-red-400"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {/* Add Drawer */}
          <Drawer
            isOpen={isAddOpen}
            setIsOpen={setIsAddOpen}
            title="Add link"
            description="Add a new link"
          >
            <LinkForm
              user={user}
              onSubmit={() => {
                fetchLinks();
                setIsAddOpen(false);
              }}
            />
          </Drawer>
          {/* Edit Drawer */}
          <Drawer
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title="Edit link"
          >
            <LinkForm
              user={user}
              data={selectedLink}
              onSubmit={() => {
                fetchLinks();
                setIsEditOpen(false);
              }}
            />
          </Drawer>
          {/* Option Drawer */}
          <Drawer
            isOpen={isSettingsOpen}
            setIsOpen={setIsSettingsOpen}
            title="Settings"
            description="Try something new! Make sure you save once you are happy with the changes."
          >
            <div className=" flex flex-col space-y-2 overflow-y-auto flex-grow">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <label className="block text-xs text-gray-500 mb-2">
                  Tell us about yourself. (max 300 characters)
                </label>
                <textarea
                  defaultValue={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  className=" border border-gray-400 max-w-xl w-full bg-gray-50 my-3 p-2 rounded-lg text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background
                </label>
                <label className="block text-xs text-gray-500 mb-2">
                  Select a background color
                </label>
                <RadioGroup
                  defaultValue={userDetails.colorScheme}
                  name="colorScheme"
                  items={[
                    {
                      id: "color_default",
                      value: 1,
                      label: "Default",
                      class:
                        "bg-white hover:bg-gray-50 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                    {
                      id: "color_sea",
                      value: 2,
                      label: "Sea",
                      class:
                        "text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gray-50 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                    {
                      id: "color_fire",
                      value: 3,
                      label: "Fire",
                      class:
                        "text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500  hover:bg-gray-50 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                    {
                      id: "color_onix",
                      value: 4,
                      label: "Onix",
                      class:
                        "text-white bg-gray-800 hover:bg-gray-700 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                  ]}
                  onChange={colorSchemeRadioHandler}
                />
              </div>
            </div>
            <div className="flex">
              <button className="transition cursor-pointer my-2 ease-in-out rounded bg-red-50 p-5  text-red-500 hover:bg-red-100">
                Logout
              </button>
              <button
                className="transition grow cursor-pointer my-2 ease-in-out rounded-lg bg-teal-50 p-5  text-teal-500 hover:bg-teal-100"
                onClick={() => console.log("Submit settings")}
              >
                Submit
              </button>
            </div>
          </Drawer>
          <Transition appear show={isDeleteOpen} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-10 overflow-y-auto"
              onClose={() => setIsDeleteOpen(false)}
            >
              <div className="min-h-screen px-4 text-center flex justify-center items-center">
                <Transition.Child
                  as={Fragment}
                  enter="transition-opacity ease-in duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-30"
                  entered="opacity-30"
                  leave="transition-opacity ease-out duration-300"
                  leaveFrom="opacity-30"
                  leaveTo="opacity-0"
                >
                  <Dialog.Overlay className=" fixed inset-0 bg-black" />
                </Transition.Child>

                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 flex"
                    >
                      Delete link
                      <button
                        onClick={() => setIsDeleteOpen(false)}
                        className="inline-flex ml-auto items-center justify-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-gray-900 bg-gray-100 hover:bg-gray-200 transition ease-in-out duration-150 cursor-pointer disabled:cursor-not-allowed disabled:text-gray-300 disabled:bg-gray-50"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-gray-500 my-2">
                      Are you sure you want to delete this link? this will be
                      permanently removed. This action cannot be undone.
                    </Dialog.Description>

                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        className="justify-center px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                        onClick={() => setIsDeleteOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="justify-center px-4 py-2 text-sm font-medium text-red-900 bg-red-100 border border-transparent rounded-md hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                        onClick={() => deleteLink(selectedLink.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition>
        </main>
      </div>
    </div>
  );
};

export default Me;
