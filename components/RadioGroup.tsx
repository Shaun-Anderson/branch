import { useState } from "react";

interface RadioGroupProps {
  name: string;
  defaultValue: string | number;
  items: RadioGroupItem[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface RadioGroupItem {
  id: string;
  value: string | number;
  label: string;
  class: string;
}

export default function RadioGroup(props: RadioGroupProps) {
  const [selected, setSelected] = useState(props.defaultValue);
  return (
    <ul className="flex overflow-x-scroll space-x-5 p-2  mx-auto">
      {props.items.map((item: RadioGroupItem, index: number) => (
        <li className="relative w-36" key={index}>
          <input
            className="sr-only peer"
            type="radio"
            checked={selected == item.value}
            value={item.value}
            name={props.name}
            id={item.id}
            onChange={(e) => {
              setSelected(item.value);
              props.onChange(e);
            }}
          />
          <label
            className={`flex w-36  p-5 border border-gray-300 cursor-pointer focus:outline-none ${item.class}`}
            htmlFor={item.id}
          >
            {item.label}
          </label>

          <div className="absolute hidden w-5 h-5 peer-checked:block top-5 right-3">
            👍
          </div>
        </li>
      ))}
    </ul>
  );
}
