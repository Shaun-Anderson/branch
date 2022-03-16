import { useForm } from "react-hook-form";
import Input from "./Input";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { supabaseClient, User } from "@supabase/supabase-auth-helpers/nextjs";
import { Link } from "../types/Link";
import { useUser } from "../utils/useUser";

export const AddForm = ({
  user,
  onSubmit,
}: {
  user: User;
  onSubmit: () => void;
}) => {
  const schema = yup
    .object({
      title: yup.string().required(),
      url: yup.string().url().required(),
    })
    .required();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ id: number; title: string; url: number }>({
    resolver: yupResolver(schema),
  });
  const submit = async (data: any) => {
    data.user_id = user.id;
    let { error } = await supabaseClient.from("links").insert(data);
    if (!error) {
      onSubmit();
    }
  };
  return (
    <form
      onSubmit={handleSubmit(submit, (errors) => console.log(errors))}
      className="px-5"
    >
      <input
        className="w-full bg-gray-100 py-2 px-3 border border-gray-200 mb-1 rounded eading-tight focus:outline-none focus:shadow-outline"
        type="text"
        placeholder="title"
        {...register("title")}
      ></input>
      {errors.title && <span>{errors.title.message}</span>}
      <input
        className="w-full bg-gray-100 py-2 px-3 mb-1 rounded"
        type="text"
        placeholder="url"
        {...register("url")}
      ></input>
      <input
        type="submit"
        className="p-2 rounded bg-indigo-100 w-full text-indigo-400"
      />
    </form>
  );
};
