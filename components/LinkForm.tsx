import { useForm } from "react-hook-form";
import Input from "./Input";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { supabaseClient, User } from "@supabase/supabase-auth-helpers/nextjs";
import { Link } from "../types/Link";
import { useUser } from "../utils/useUser";
import FormInput from "./FormInput";

export const LinkForm = ({
  user,
  data,
  onSubmit,
}: {
  user: User;
  data?: Link | undefined;
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
  } = useForm<Link>({
    resolver: yupResolver(schema),
    defaultValues: data,
  });
  const submit = async (data: any) => {
    data.user_id = user.id;
    let { error } = await supabaseClient.from("links").upsert(data);
    if (!error) {
      onSubmit();
    }
  };
  return (
    <form onSubmit={handleSubmit(submit, (errors) => console.log(errors))}>
      <FormInput type="text" label="Title" name="title" control={control} />
      <FormInput type="text" label="Url" name="url" control={control} />
      <input
        type="submit"
        className="transition cursor-pointer my-2 ease-in-out rounded-sm bg-indigo-50 p-2 w-full text-indigo-500 hover:bg-indigo-100"
      />
    </form>
  );
};
