import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/solid";
import { Fragment } from "react";
import Button from "../Button";

type DrawerProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Drawer({
  title = "",
  description = "",
  children,
  isOpen,
  setIsOpen,
}: DrawerProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        unmount={false}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed z-30 inset-0 overflow-y-auto"
      >
        <div className="flex w-full sm:w-3/4 h-screen">
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
            <Dialog.Overlay className="z-40 fixed inset-0 bg-black" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div
              className={`flex flex-col justify-between z-50
	                          w-full max-w-full sm:max-w-lg md:max-w-sm p-6 overflow-hidden text-left
	                          align-middle shadow-xl rounded-r-2xl bg-white`}
            >
              <div>
                <Dialog.Title className="font-bold text-3xl md:text-3xl flex ">
                  {title}
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex ml-auto items-center justify-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-gray-900 bg-gray-100 hover:bg-gray-200 transition ease-in-out duration-150 cursor-pointer disabled:cursor-not-allowed disabled:text-gray-300 disabled:bg-gray-50"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </Dialog.Title>
                <Dialog.Description className="mt-3 mb-2 text-gray-500">
                  {description}
                </Dialog.Description>
                {children}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
