// Copyright (C) 2022-present Daniel31x13 <daniel31x13@gmail.com>
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faClose } from "@fortawesome/free-solid-svg-icons";
import Checkbox from "../Checkbox";
import useAccountStore from "@/store/account";
import { AccountSettings } from "@/types/global";
import { useSession } from "next-auth/react";
import { resizeImage } from "@/lib/client/resizeImage";
import fileExists from "@/lib/client/fileExists";

type Props = {
  toggleSettingsModal: Function;
};

export default function UserSettings({ toggleSettingsModal }: Props) {
  const { update } = useSession();
  const { account, updateAccount } = useAccountStore();

  useEffect(() => {
    const determineProfilePicSource = async () => {
      const path = `/api/avatar/${account.id}`;
      const imageExists = await fileExists(path).catch((e) => console.log(e));
      if (imageExists) setUser({ ...user, profilePic: path });
    };

    determineProfilePicSource();
  }, []);

  const [user, setUser] = useState<AccountSettings>({
    ...account,
    profilePic: null,
  });

  const handleImageUpload = async (e: any) => {
    const file: File = e.target.files[0];

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["png", "jpeg", "jpg"];

    if (allowedExtensions.includes(fileExtension as string)) {
      const resizedFile = await resizeImage(file);

      console.log(resizedFile.size);

      if (
        resizedFile.size < 1048576 // 1048576 Bytes == 1MB
      ) {
        const reader = new FileReader();

        reader.onload = () => {
          setUser({ ...user, profilePic: reader.result as string });
        };

        reader.readAsDataURL(resizedFile);
      } else {
        console.log("Please select a PNG or JPEG file thats less than 1MB.");
      }
    } else {
      console.log("Invalid file format.");
    }
  };

  const submit = async () => {
    await updateAccount(user);

    if (user.email !== account.email || user.name !== account.name)
      update({ email: user.email, name: user.name });
  };

  return (
    <div className="flex flex-col gap-3 sm:w-[35rem] w-80">
      <p className="text-xl text-sky-500 mb-2 text-center">Settings</p>

      <p className="text-sky-600">Profile Settings</p>

      {user.email !== account.email || user.name !== account.name ? (
        <p className="text-gray-500 text-sm">
          Note: The page will be refreshed to apply the changes of "Email" or
          "Display Name".
        </p>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-3 auto-rows-auto">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-bold text-sky-300 mb-2">Display Name</p>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="w-full rounded-md p-2 border-sky-100 border-solid border outline-none focus:border-sky-500 duration-100"
            />
          </div>

          <div>
            <p className="text-sm font-bold text-sky-300 mb-2">Email</p>
            <input
              type="text"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full rounded-md p-2 border-sky-100 border-solid border outline-none focus:border-sky-500 duration-100"
            />
          </div>

          <div>
            <p className="text-sm font-bold text-sky-300 mb-2">Password</p>

            <div className="w-fit">
              <div className="border border-sky-100 rounded-md bg-white px-2 py-1 text-center select-none cursor-pointer text-sky-900 duration-100 hover:border-sky-500">
                Change Password
              </div>
            </div>
          </div>
        </div>

        <div className="sm:row-span-2 sm:justify-self-center mb-3">
          <p className="text-sm font-bold text-sky-300 mb-2 sm:text-center">
            Profile Photo
          </p>
          <div className="w-28 h-28 flex items-center justify-center border border-sky-100 rounded-full relative">
            {user.profilePic && user.profilePic !== "DELETE" ? (
              <div>
                <img
                  alt="Profile Photo"
                  className="rounded-full object-cover h-28 w-28 border border-sky-100 border-opacity-0"
                  src={user.profilePic}
                />
                <div
                  onClick={() =>
                    setUser({
                      ...user,
                      profilePic: "DELETE",
                    })
                  }
                  className="absolute top-1 left-1 w-5 h-5 flex items-center justify-center border p-1 bg-white border-sky-100 rounded-full text-gray-500 hover:text-red-500 duration-100 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faClose} className="w-3 h-3" />
                </div>
              </div>
            ) : (
              <FontAwesomeIcon
                icon={faUser}
                className="w-10 h-10 text-sky-400"
              />
            )}

            <div className="absolute -bottom-2 left-0 right-0 mx-auto w-fit text-center">
              <label
                htmlFor="upload-photo"
                title="PNG or JPG (Max: 3MB)"
                className="border border-sky-100 rounded-md bg-white px-2 text-center select-none cursor-pointer text-sky-900 duration-100 hover:border-sky-500"
              >
                Browse...
                <input
                  type="file"
                  name="photo"
                  id="upload-photo"
                  accept=".png, .jpeg, .jpg"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <hr />

      <p className="text-sky-600">Data Settings</p>

      <div className="w-fit">
        <div className="border border-sky-100 rounded-md bg-white px-2 py-1 text-center select-none cursor-pointer text-sky-900 duration-100 hover:border-sky-500">
          Export Data
        </div>
      </div>

      <hr />

      <p className="text-sky-600">Privacy Settings</p>

      <Checkbox
        label="Limit who can add you to other Collections"
        state={user.collectionProtection}
        className="text-sm sm:text-base"
        onClick={() =>
          setUser({ ...user, collectionProtection: !user.collectionProtection })
        }
      />

      {user.collectionProtection ? (
        <div>
          <p className="text-gray-500 text-sm mb-3">
            Please enter the email addresses of the users who are allowed to add
            you to additional collections in the box below, separated by spaces.
          </p>
          <textarea
            className="w-full resize-none border rounded-md duration-100 bg-white p-2 outline-none border-sky-100 focus:border-sky-500"
            placeholder="No one can add you to any collections right now..."
          ></textarea>
        </div>
      ) : null}

      <div
        className="mx-auto mt-2 bg-sky-500 text-white flex items-center gap-2 py-2 px-5 rounded-md select-none font-bold cursor-pointer duration-100 hover:bg-sky-400"
        onClick={submit}
      >
        Apply Settings
      </div>
    </div>
  );
}