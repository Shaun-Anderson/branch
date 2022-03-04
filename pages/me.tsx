import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { DropResult, resetServerContext } from "react-beautiful-dnd";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "../components/dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGrip,
  faGripVertical,
  faEdit,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

interface Item {
  id: string;
  content: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  resetServerContext();
  return { props: {} };
};

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

// const getItemStyle = (
//   isDragging: boolean,
//   draggableStyle: DraggingStyle | NotDraggingStyle | undefined
// ): React.CSSProperties => ({
//   // some basic styles to make the items look a bit nicer
//   userSelect: "none",
//   padding: grid * 2,
//   margin: `0 0 ${grid}px 0`,

//   // change background colour if dragging
//   background: isDragging ? "lightgreen" : "grey",

//   // styles we need to apply on draggables
//   ...draggableStyle,
// });

const Me: NextPage = () => {
  const [state, setState] = useState(getItems(5));
  const myLoader = ({ src, width }) => {
    return `https://via.placeholder.com/${width}`;
  };

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

  return (
    <div className={styles.container}>
      <Head>
        <title>My Profile</title>
        <meta name="description" content="Customise you branches" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Image
          loader={myLoader}
          src="me.png"
          alt="Picture of the author"
          className="rounded-full"
          width={100}
          height={100}
        />
        <h1 className="text-3xl font-bold mt-5">
          <a>@Username</a>
        </h1>

        <p
          style={{ width: "500px" }}
          className="text my-2 p-5 rounded-lg text-gray-500 text-center"
        >
          This is an example of a bio
        </p>

        <div className=" min-w-0 sm: w-96 max-w-lg">
          <button className=" transition my-2 ease-in-out rounded-sm bg-teal-50 p-2 w-full text-teal-500 hover:bg-teal-200">
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
                            className="w-5 h-5 text-black text-opacity-20"
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
                          <Image
                            loader={myLoader}
                            src="me.png"
                            alt="Picture of the author"
                            className="rounded-md"
                            width={40}
                            height={40}
                          />
                          <div className="ml-5">
                            <h2 className="text-md">{item.content}</h2>
                          </div>
                        </a>
                        <div className="align-center my-1 flex">
                          <button className=" h-full w-16 flex justify-center items-center p-2 self-center bg-amber-50 hover:bg-amber-100">
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
        {/* <ul>
<a
                          href="https://nextjs.org/docs"
                          className="transition ease-in-out w-96 max-w-full p-3 border bg-stone-100 border-stone-200 rounded-md flex hover:scale-105"

                          // style={getItemStyle(
                          //   snapshot.isDragging,
                          //   provided.draggableProps.style
                          // )}
                        >
                          <Image
                            loader={myLoader}
                            src="me.png"
                            alt="Picture of the author"
                            className="rounded-full"
                            width={50}
                            height={50}
                          />
                          <div className="ml-5">
                            <h2 className="text-lg">{item.content}</h2>
                            <p className="text">optional info about the link</p>
                          </div>
                        </a>
        </ul> */}
      </main>
    </div>
  );
};

export default Me;
