import { Dispatch, FC, SetStateAction } from "react";

interface DrawerProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  title: string;
}
export const Drawer: FC<DrawerProps> = ({
  children,
  title,
  isOpen,
  setIsOpen,
}): JSX.Element => {
  return (
    <main
      className={
        " fixed overflow-hidden z-10 bg-gray-900 bg-opacity-25 inset-0 transform ease-in-out " +
        (isOpen
          ? " transition-opacity opacity-100 duration-500 translate-x-0  "
          : " transition-all opacity-0 duration-0 delay-500 translate-x-full  ")
      }
    >
      <section
        className={
          " w-screen max-w-lg z-50 rounded-l-xl right-0 absolute bg-white h-full shadow-xl delay-400 duration-500 ease-in-out transition-all transform  " +
          (isOpen ? " translate-x-0 " : " translate-x-full ")
        }
      >
        <article className="relative w-screen border-l-xl max-w-lg pb-10 flex flex-col space-y-6 overflow-y-scroll h-full">
          <header className="p-5 font-bold text-2xl">{title}</header>
          {children}
        </article>
      </section>
      <section
        className=" w-screen h-full cursor-pointer "
        onClick={() => {
          setIsOpen(false);
        }}
      ></section>
    </main>
  );
};
