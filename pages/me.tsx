import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { DropResult, resetServerContext } from "react-beautiful-dnd";
import { Fragment, useState } from "react";
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
import {
  colorScheme,
  linkColorScheme,
  linkRounding,
} from "../utils/colorSchemes";
import {
  ArrowLeftIcon,
  CogIcon,
  DotsVerticalIcon,
  PencilAltIcon,
  PlusIcon,
  SelectorIcon,
  TrashIcon,
  UserCircleIcon,
  XIcon,
} from "@heroicons/react/solid";
import RadioGroup from "../components/RadioGroup";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { getErrorMessage } from "@/utils/errors";

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

interface MeProps {
  user: User;
  userDetails: UserDetails;
  data: Link[];
}

const Me: NextPage<MeProps> = ({
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
  const [avatar_url, setAvatarUrl] = useState(userDetails.avatar_url);
  const [loading, setLoading] = useState(false);

  // Settings State
  // Loacl version of user detials so the user can update and view their changes before submitting them.
  let [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userSettings, setUserSettings] = useState<UserDetails>(userDetails);

  console.log(userSettings);

  async function updateProfile() {
    try {
      setLoading(true);
      const updates = {
        ...userSettings,
        updated_at: new Date(),
      };

      let { error } = await supabaseClient.from("profiles").upsert(updates, {
        returning: "minimal",
      });

      if (error) {
        throw error;
      }
      setIsSettingsOpen(false);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  async function updateAvatar(avatar_url: string) {
    try {
      setLoading(true);
      const updates = {
        id: user?.id,
        avatar_url,
        updated_at: new Date(),
      };

      let { error } = await supabaseClient.from("profiles").upsert(updates, {
        returning: "minimal",
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }
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

  // Dnd Functions
  const reorder = (
    list: Link[],
    startIndex: number,
    endIndex: number
  ): Link[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

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

  return (
    <div className={`${Object.values(colorScheme)[userSettings.color_scheme]}`}>
      <div className={styles.container}>
        <Head>
          <title>My Profile</title>
          <meta name="description" content="Customise you branches" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.main}>
          <Avatar
            url={avatar_url as string}
            size={100}
            onUpload={(url: string) => {
              setAvatarUrl(url);
              updateAvatar(url);
            }}
          />
          <h1 className="text-3xl font-bold mt-5">@{userDetails?.username}</h1>
          <p className=" max-w-xl w-full text-sm text-center my-4 p-2 rounded-lg whitespace-pre-line">
            {userSettings.bio}
          </p>
          <div className=" w-fit justify-center flex space-x-2 absolute bottom-2 px-3 rounded-3xl py-1 bg-neutral-500/10">
            <button
              onClick={() => setIsAddOpen(true)}
              className=" transition flex items-center text-sm  font-medium my-1 ease-in-out rounded-2xl  py-1 px-3  text-teal-500 hover:bg-teal-500 hover:text-white"
            >
              <PlusIcon
                className="w-5 h-5 mr-2 "
                aria-hidden="true"
              />
              New link
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className=" transition my-2 flex items-center ease-in-out rounded-xl bg-indigo-50 p-1  text-indigo-500 hover:bg-indigo-100"
            >
              <CogIcon
                className="w-6 h-6"
                aria-hidden="true"
              />
            </button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot): JSX.Element => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ width: "100%", maxWidth: "700px" }}
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
                            className={`transition justify-center ease-in-out my-1 flex-grow max-w-full p-3 flex items-center ${
                              Object.values(linkColorScheme)[
                                userSettings.link_color_scheme
                              ]
                            } ${
                              Object.values(linkRounding)[
                                userSettings.link_rounding
                              ]
                            }`}
                          >
                            <h2 className="text-md">{item.title}</h2>
                          </a>
                          <div className="flex justify-center sm:invisible sm:hidden">
                            <Menu
                              as="div"
                              className="relative inline-block text-left self-center"
                            >
                              <Menu.Button className="inline-flex transition-all ease-in-out p-2 rounded-md justify-center w-full text-sm font-medium text-white bg-gray-50 hover:bg-gray-100 bg-opacity-70 hover:scale-105 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                                <DotsVerticalIcon
                                  className="w-5 h-5 sm:w-4 sm:h-4  text-gray-400"
                                  aria-hidden="true"
                                />
                              </Menu.Button>
                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items className="absolute z-10 right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                  <div className="px-1 py-1 ">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => {
                                            setSelectedLink(item);
                                            setIsEditOpen(true);
                                          }}
                                          className={`${
                                            active
                                              ? "bg-violet-500 text-white"
                                              : "text-gray-900"
                                          } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                        >
                                          <PencilAltIcon
                                            className="w-4 h-4 mr-3"
                                            aria-hidden="true"
                                          />
                                          Edit
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => {
                                            setSelectedLink(item);
                                            setIsDeleteOpen(true);
                                          }}
                                          className={`${
                                            active
                                              ? "bg-violet-500 text-white"
                                              : "text-gray-900"
                                          } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                        >
                                          <TrashIcon
                                            className="w-4 h-4 mr-3"
                                            aria-hidden="true"
                                          />
                                          Delete
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </div>

                          <div className=" hidden align-center my-1 sm:visible sm:flex space-x-2 ">
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
                  defaultValue={userSettings.bio}
                  onChange={(e) =>
                    setUserSettings({
                      ...userSettings,
                      bio: e.target.value,
                    })
                  }
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
                  defaultValue={userDetails.color_scheme}
                  name="color_scheme"
                  items={[
                    {
                      id: "color_default",
                      value: 1,
                      label: "Default",
                      class:
                        "bg-white rounded-md hover:bg-gray-50 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                    {
                      id: "color_sea",
                      value: 2,
                      label: "Sea",
                      class:
                        "text-white rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gray-50 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                    {
                      id: "color_fire",
                      value: 3,
                      label: "Fire",
                      class:
                        "text-white rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500  hover:bg-gray-50 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                    {
                      id: "color_onix",
                      value: 4,
                      label: "Onix",
                      class:
                        "text-white rounded-md  bg-gray-800 hover:bg-gray-700 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                  ]}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    console.log(event);
                    setUserSettings({
                      ...userSettings,
                      color_scheme: event.target.value as unknown as number,
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Theme
                </label>
                <label className="block text-xs text-gray-500 mb-2">
                  Select a link theme.
                </label>
                <RadioGroup
                  defaultValue={userDetails.link_color_scheme}
                  name="link"
                  items={[
                    {
                      id: "link_default",
                      value: 1,
                      label: "Light",
                      class:
                        "bg-white text-black rounded-md hover:bg-gray-50 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                    {
                      id: "link_regal",
                      value: 2,
                      label: "Regal",
                      class:
                        "bg-regal-blue text-white rounded-md hover:bg-gray-600 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                    {
                      id: "link_dark",
                      value: 3,
                      label: "Dark",
                      class:
                        "bg-black text-white rounded-md hover:bg-gray-600 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                  ]}
                  onChange={(event) => {
                    setUserSettings({
                      ...userSettings,
                      link_color_scheme: event.target
                        .value as unknown as number,
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link rounding
                </label>
                <label className="block text-xs text-gray-500 mb-2">
                  Select how rounded you links should be.
                </label>
                <RadioGroup
                  defaultValue={userDetails.link_rounding}
                  name="link_rounding"
                  items={[
                    {
                      id: "rounding_sm",
                      value: 1,
                      label: "SML",
                      class:
                        "bg-white rounded-sm hover:bg-gray-50 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                    {
                      id: "rounding_md",
                      value: 2,
                      label: "MED",
                      class:
                        "bg-white  rounded-md hover:bg-gray-50 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                    {
                      id: "rounding_lg",
                      value: 3,
                      label: "LRG",
                      class:
                        "bg-white rounded-xl hover:bg-gray-50 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                    {
                      id: "rounding_xl",
                      value: 4,
                      label: "XL",
                      class:
                        "bg-white rounded-full hover:bg-gray-50 peer-checked:ring-green-500 peer-checked:ring-2 peer-checked:border-transparent",
                    },
                  ]}
                  onChange={(event) => {
                    setUserSettings({
                      ...userSettings,
                      link_rounding: event.target.value as unknown as number,
                    });
                  }}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="transition cursor-pointer my-2 ease-in-out rounded-lg bg-red-50 p-5  text-red-500 hover:bg-red-100">
                Logout
              </button>
              <button
                className="transition grow cursor-pointer my-2 ease-in-out rounded-lg bg-teal-100 p-5  text-teal-900 hover:bg-teal-200"
                onClick={() => updateProfile()}
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
                    <p className="text-sm text-black">{selectedLink?.title}</p>

                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        className="justify-center px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                        onClick={() => setIsDeleteOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="justify-center px-4 py-2 text-sm font-medium text-red-900 bg-red-100 border border-transparent rounded-md hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                        onClick={() => deleteLink(selectedLink!.id)}
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
