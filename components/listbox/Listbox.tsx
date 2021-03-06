import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { Listbox as BaseListbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";

interface ListboxItem {
  value: string | number;
  label: string;
}

interface ListboxProps {
  value: ListboxItem;
  items: ListboxItem[];
  onChange: (data: ListboxItem) => {};
}

export default function Listbox({ value, items, onChange }: ListboxProps) {
  const [selected, setSelected] = useState(value);

  return (
    <div className="w-full">
      <BaseListbox
        value={selected}
        onChange={(data: ListboxItem) => {
          setSelected(data);
          onChange(data);
        }}
      >
        <div className="relative mt-1">
          <BaseListbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
            <span className="block truncate">{selected.label}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <SelectorIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </BaseListbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <BaseListbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {items.map((item: ListboxItem, personIdx: number) => (
                <BaseListbox.Option
                  key={personIdx}
                  className={({ active }) =>
                    `cursor-default select-none relative py-2 pl-10 pr-4 ${
                      active ? "text-amber-900 bg-amber-100" : "text-gray-900"
                    }`
                  }
                  value={item}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {item.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                          <CheckIcon className="w-5 h-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </BaseListbox.Option>
              ))}
            </BaseListbox.Options>
          </Transition>
        </div>
      </BaseListbox>
    </div>
  );
}
