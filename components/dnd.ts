import dynamic from "next/dynamic";
import {
  DragDropContextProps,
  DraggableProps,
  DroppableProps,
} from "react-beautiful-dnd";

export const DragDropContext = dynamic<DragDropContextProps>(
  () => import("react-beautiful-dnd").then((r) => r.DragDropContext),
  { ssr: false }
);

export const Draggable = dynamic<DraggableProps>(
  () => import("react-beautiful-dnd").then((r) => r.Draggable),
  { ssr: false }
);

export const Droppable = dynamic<DroppableProps>(
  () => import("react-beautiful-dnd").then((r) => r.Droppable),
  { ssr: false }
);
