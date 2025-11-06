import Image from "next/image";
import Link from "next/link";
import { SignOut } from "./auth/signout-button";
import { auth } from "@/lib/auth";
import { Navlink } from "./navlink";

export default async function Sidebar() {
  const session = await auth();

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2 shadow-xl">
      <div className="mb-5 p-4 flex items-center justify-center">
        <div className="border-black border-solid border rounded-full p-5">
          <Image
            src="/logo-ugm.png"
            alt="University logo"
            width={60}
            height={60}
            className="rounded-full"
          />
        </div>
      </div>
      <div className="flex flex-col">
        <Navlink href={"/dashboard"}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
          </svg>
          <div className="pl-2">
            Dashboard
          </div>
        </Navlink>
        <Navlink href={"/dashboard/dosen"}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
          </svg>
          <div className="pl-2">
            Dosen
          </div>
        </Navlink>
        <div className="border-t-2 border-solid border-black pt-2 mt-2"> 
          <div className="">
            <SignOut />
          </div>
        </div>
      </div>
    </div>
  );
}