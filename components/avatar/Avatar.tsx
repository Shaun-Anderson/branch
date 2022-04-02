import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { ChangeEventHandler, useEffect, useState } from "react";

export default function Avatar({
  url,
  size,
  onUpload,
}: {
  url: string;
  size: number;
  onUpload: (url: string) => void;
}) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabaseClient.storage
        .from("avatars")
        .download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data as Blob);
      setAvatarUrl(url);
    } catch (error) {
      let message;
      if (error instanceof Error) message = error.message;
      else message = String(error);
      console.log("Error downloading image: ", message);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      if (avatarUrl) {
        console.log(`trying to update ${avatarUrl}`);
        console.log(`trying to update ${url}`);

        const { data, error: updateError } = await supabaseClient.storage
          .from("avatars")
          .update(url, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (updateError) {
          throw updateError;
        }
        console.log("Update Successful");
      } else {
        let { error: uploadError } = await supabaseClient.storage
          .from("avatars")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }
        console.log("Upload successful");
      }
      onUpload(filePath);
    } catch (error) {
      let message;
      if (error instanceof Error) message = error.message;
      else message = String(error);
      alert(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div style={{ width: size }}>
        <label className="button primary block" htmlFor="single">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="avatar image rounded-full cursor-pointer object-cover"
              style={{ height: size, width: size }}
            />
          ) : (
            <div
              className="avatar no-image bg-gray-500 rounded-full"
              style={{ height: size, width: size }}
            />
          )}
        </label>
        <input
          style={{
            visibility: "hidden",
            // position: "absolute",
            width: 0,
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  );
}
