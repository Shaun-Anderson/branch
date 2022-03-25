import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
// import Image from "next/image";
import styles from "../styles/Home.module.css";
import { DropResult, resetServerContext } from "react-beautiful-dnd";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "../components/dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGrip,
  faGripVertical,
  faEdit,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Drawer } from "../components/drawer";
import { Navigation } from "../components/navigation";
import {
  supabaseClient,
  User,
  withAuthRequired,
} from "@supabase/supabase-auth-helpers/nextjs";
import { useUser } from "../utils/useUser";
import Avatar from "../components/Avatar";
import { AddForm } from "../components/AddForm";
import { Link } from "../types/Link";
import { UserDetails } from "../types/UserDetails";

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
  // const { isLoading, userDetails } = useUser();
  const [avatar_url, setAvatarUrl] = useState(userDetails.avatar_url);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(userDetails.username);
  const [links, setLinks] = useState<Link[]>(data);
  const myLoader = ({ src, width }) => {
    return `https://via.placeholder.com/${width}`;
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

  return (
    <div className={styles.container}>
      <Head>
        <title>My Profile</title>
        <meta name="description" content="Customise you branches" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <main className={styles.main}>
        <Avatar
          url={avatar_url}
          size={100}
          onUpload={(url) => {
            setAvatarUrl(url);
            updateProfile({ username, avatar_url: url });
          }}
        />
        <h1 className="text-3xl font-bold mt-5">
          <input
            value={`@${userDetails?.username}`}
            onChange={(event) => setUsername(event.target.value)}
          ></input>
        </h1>

        <p
          style={{ width: "500px" }}
          className="text my-2 p-5 rounded-lg text-gray-500 text-center"
        >
          {userDetails?.bio}
        </p>

        <div className=" min-w-0 sm: w-96 max-w-lg">
          <button
            onClick={() => setAddOpen(true)}
            className=" transition my-2 ease-in-out rounded-sm bg-teal-50 p-2 w-full text-teal-500 hover:bg-teal-100"
          >
            New link
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
                          <FontAwesomeIcon
                            className="w-3 h-3 text-black text-opacity-20"
                            icon={faGripVertical}
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
                            <FontAwesomeIcon
                              className="w-4 h-4 text-amber-500"
                              icon={faEdit}
                            />
                          </button>
                          <button className=" h-full w-16 p-2 flex justify-center items-center self-center rounded-r-md  bg-red-50 hover:bg-red-100">
                            <FontAwesomeIcon
                              className="w-4 h-4 text-red-500"
                              icon={faTrashAlt}
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
        <Drawer isOpen={addOpen} setIsOpen={setAddOpen} title="Add link">
          <AddForm
            user={user}
            onSubmit={() => {
              fetchLinks();
              setAddOpen(false);
            }}
          />
        </Drawer>
      </main>
    </div>
  );
};

export default Me;
