import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
// import Image from "next/image";
import styles from "../styles/Home.module.css";
import { DropResult, resetServerContext } from "react-beautiful-dnd";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "../components/dnd";
import { Navigation } from "../components/navigation";
import {
  supabaseClient,
  User,
  withAuthRequired,
} from "@supabase/supabase-auth-helpers/nextjs";
import Avatar from "../components/avatar/Avatar";
import { AddForm } from "../components/AddForm";
import Drawer from "../components/drawer/Drawer";
import { Link } from "../types/Link";
import { UserDetails } from "../types/UserDetails";
import { colorScheme as colorSchemeEnum } from "../utils/colorSchemes";
import Listbox from "../components/listbox/Listbox";
import {
  CogIcon,
  PencilAltIcon,
  SelectorIcon,
  TrashIcon,
  UserCircleIcon,
} from "@heroicons/react/solid";

export const _getServerSideProps: GetServerSideProps = async ({ req }) => {
  resetServerContext();
  const { user, token } = await supabaseClient.auth.api.getUserByCookie(req);
  supabaseClient.auth.setAuth(token);
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
  const [isOpen, setIsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [colorScheme, setColorScheme] = useState(userDetails.colorScheme);
  const [avatar_url, setAvatarUrl] = useState(userDetails.avatar_url);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(userDetails.username);
  const [links, setLinks] = useState<Link[]>(data);
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
  console.log({
    value: colorScheme,
    label: Object.keys(colorSchemeEnum)[colorScheme],
  });
  async function updateProfile({ username, avatar_url }) {
    try {
      setLoading(true);
      // const user = supabaseClient.auth.user();
      console.log("Upsert");
      console.log(user);
      const updates = {
        id: user?.id,
        username,
        avatar_url,
        updated_at: new Date(),
      };

      let { error } = await supabaseClient.from("profiles").upsert(updates, {
        returning: "minimal", // Don't return the value after inserting
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      //alert(error.message)
    } finally {
      setLoading(false);
    }
  }

  async function updateColorScheme(colorSchemeId: number) {
    try {
      setLoading(true);
      const updates = {
        id: user?.id,
        colorScheme: colorSchemeId,
        updated_at: new Date(),
      };

      let { error } = await supabaseClient.from("profiles").upsert(updates, {
        returning: "minimal", // Don't return the value after inserting
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      //alert(error.message)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${Object.values(colorSchemeEnum)[colorScheme]}`}>
      <Navigation />
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
          <textarea
            defaultValue={userDetails?.bio}
            placeholder="Tell us about yourself"
            className=" max-w-xl w-full text-sm bg-gray-50 my-4 p-2 rounded-lg text-gray-500"
          />

          <div className=" min-w-0 sm: w-96 max-w-lg flex">
            <button
              onClick={() => setAddOpen(true)}
              className=" transition grow my-2 ease-in-out rounded-sm bg-teal-50 p-2 w-full text-teal-500 hover:bg-teal-100"
            >
              New link
            </button>
            <button
              onClick={() => setIsNewOpen(true)}
              className=" transition grow-0 my-2 ease-in-out rounded-sm bg-teal-50 p-2 w-full text-teal-500 hover:bg-teal-100"
            >
              <CogIcon className="w-5 h-5 text-teal-400" aria-hidden="true" />
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
                          className="flex"
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
                            className="transition ease-in-out my-1 flex-grow max-w-full p-3 bg-stone-50  rounded-l-md flex items-center"
                          >
                            <div className="ml-5">
                              <h2 className="text-md">{item.title}</h2>
                            </div>
                          </a>
                          <div className="align-center my-1 flex">
                            <button
                              className=" h-full w-16 flex justify-center items-center p-2 self-center bg-amber-50 hover:bg-amber-100"
                              onClick={() => setIsOpen(true)}
                            >
                              <PencilAltIcon
                                className="w-5 h-5 text-amber-400"
                                aria-hidden="true"
                              />
                            </button>
                            <button className=" h-full w-16 p-2 flex justify-center items-center self-center rounded-r-md  bg-red-50 hover:bg-red-100">
                              <TrashIcon
                                className="w-5 h-5 text-red-400"
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
          <Drawer isOpen={isOpen} setIsOpen={setIsOpen} title="Edit link">
            hi there
          </Drawer>
          {/* Add Drawer */}
          <Drawer
            isOpen={addOpen}
            setIsOpen={setAddOpen}
            title="Add link"
            description="Add a new link"
          >
            <AddForm
              user={user}
              onSubmit={() => {
                fetchLinks();
                setAddOpen(false);
              }}
            />
          </Drawer>
          {/* Option Drawer */}
          <Drawer
            isOpen={isNewOpen}
            setIsOpen={setIsNewOpen}
            title="Options"
            description="Try something new!"
          >
            <p>Options</p>
            <Listbox
              value={{
                value: colorScheme,
                label: Object.keys(colorSchemeEnum)[colorScheme],
              }}
              onChange={async (data) => {
                console.log("ON CHANGE: " + data.value);
                setColorScheme(data.value as number);
                updateColorScheme(data.value as number);
              }}
              items={[
                { value: 1, label: "Default" },
                { value: 2, label: "Sky" },
                { value: 3, label: "Fire" },
              ]}
            />
          </Drawer>
        </main>
      </div>
    </div>
  );
};

export default Me;
