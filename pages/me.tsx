import type { NextPage } from "next";
import Head from "next/head";
import Image, { ImageLoader } from "next/image";
import styles from "../styles/Home.module.css";
import {
  DragDropContext,
  Droppable,
  Draggable,
  NotDraggingStyle,
  DraggingStyle,
  DropResult,
} from "react-beautiful-dnd";
import { useState } from "react";

interface Item {
  id: string;
  content: string;
}

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

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot): JSX.Element => (
              <ul
                className="flex flex-col mt-5"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {state.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot): JSX.Element => (
                      <div
                        className="flex"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        {" "}
                        <div {...provided.dragHandleProps}>handle</div>
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
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        {/* <ul>
          <a
            href="https://nextjs.org/docs"
            className="transition ease-in-out w-96 max-w-full p-3 border bg-stone-100 border-stone-200 rounded-md flex hover:scale-105"
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
              <h2 className="text-lg">This is a link title</h2>
              <p className="text">optional info about the link</p>
            </div>
          </a>
        </ul> */}
      </main>
    </div>
  );
};

export default Me;
