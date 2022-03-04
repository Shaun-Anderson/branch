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

        <p className="text my-2">This is an example of a bio</p>

        <div className=" min-w-0 sm: w-96 max-w-lg">
          <button className=" transition ease-in-out rounded-sm bg-teal-500 p-2 w-full text-white hover:scale-105 hover:bg-teal-600">
            New link
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot): JSX.Element => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
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
                            className="w-5 h-5 text-gray-400"
                            icon={faGripVertical}
                          />
                        </div>
                        <a
                          href="https://nextjs.org/docs"
                          className="transition ease-in-out m-1 w-96 max-w-full p-3 border bg-stone-100 border-stone-200 rounded-md flex hover:scale-105"
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
                        <div className="align-center">
                          <button className=" h-9 w-9 p-2 rounded-sm hover:bg-amber-100">
                            <FontAwesomeIcon
                              className="w-4 h-4 text-amber-500"
                              icon={faEdit}
                            />
                          </button>
                          <button className=" h-9 w-9 p-2 rounded-sm hover:bg-red-100">
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
