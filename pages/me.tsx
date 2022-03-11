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

interface Item {
  id: string;
  content: string;
}

export const _getServerSideProps: GetServerSideProps = async (context) => {
  resetServerContext();
  return { props: {} };
};

export const getServerSideProps = withAuthRequired({
  getServerSideProps: _getServerSideProps,
  redirectTo: "/signin",
});

// fake data generator
const getItems = (count: number): Item[] =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k}`,
    content: `item ${k}`,
  }));

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

const Me: NextPage = ({ user }: { user: User }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, userDetails } = useUser();
  const [avatar_url, setAvatarUrl] = useState(userDetails?.avatar_url);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(userDetails?.full_name);
  const [state, setState] = useState(getItems(5));
  const myLoader = ({ src, width }) => {
    return `https://via.placeholder.com/${width}`;
  };

  useEffect(() => {
    setAvatarUrl(userDetails?.avatar_url);
  }, [userDetails]);

  const onDragEnd = (result: DropResult): void => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items: Item[] = reorder(
      state,
      result.source.index,
      result.destination.index
    );

    setState(items);
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
        {/* <Image
          loader={myLoader}
          src={userDetails?.avatar_url ?? ""}
          alt="Picture of the author"
          className="rounded-full"
          width={100}
          height={100}
        /> */}
        <Avatar
          url={avatar_url}
          size={100}
          onUpload={(url) => {
            setAvatarUrl(url);
            updateProfile({ username, avatar_url: url });
          }}
        />
        <h1 className="text-3xl font-bold mt-5">
          <a>@Username</a>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          ></input>
        </h1>

        <p
          style={{ width: "500px" }}
          className="text my-2 p-5 rounded-lg text-gray-500 text-center"
        >
          This is an example of a bio
        </p>

        <div className=" min-w-0 sm: w-96 max-w-lg">
          <button className=" transition my-2 ease-in-out rounded-sm bg-teal-50 p-2 w-full text-teal-500 hover:bg-teal-100">
            New link
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot): JSX.Element => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ width: "800px" }}
                // style={getListStyle(snapshot.isDraggingOver)}
              >
                {state.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot): JSX.Element => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex"
                        // style={getItemStyle(
                        //   snapshot.isDragging,
                        //   provided.draggableProps.style
                        // )}
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
                          href="https://nextjs.org/docs"
                          className="transition ease-in-out my-1 flex-grow max-w-full p-3 bg-stone-50  rounded-l-md flex items-center"
                          // style={getItemStyle(
                          //   snapshot.isDragging,
                          //   provided.draggableProps.style
                          // )}
                        >
                          {/* <Image
                            loader={myLoader}
                            src="me.png"
                            alt="Picture of the author"
                            className="rounded-md"
                            width={40}
                            height={40}
                          /> */}
                          <div className="ml-5">
                            <h2 className="text-md">{item.content}</h2>
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
      </main>
    </div>
  );
};

export default Me;
