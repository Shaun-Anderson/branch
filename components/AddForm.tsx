import { useForm } from "react-hook-form";
import Input from "./Input";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { supabaseClient, User } from "@supabase/supabase-auth-helpers/nextjs";
import { Link } from "../types/Link";
import { useUser } from "../utils/useUser";
import FormInput from "./FormInput";

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
    control,
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
      <FormInput label="Title" name="title" control={control} />
      <FormInput label="Url" name="url" control={control} />
      <input
        type="submit"
        className="transition cursor-pointer my-2 ease-in-out rounded-sm bg-indigo-50 p-2 w-full text-indigo-500 hover:bg-indigo-100"
      />
    </form>
  );
};
