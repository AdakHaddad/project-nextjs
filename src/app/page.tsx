'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setError("Invalid credentials. Please try again.");
    } else {
      router.push("/dashboard"); // Redirect to dashboard or desired page on successful login
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-24 bg-white text-black">
      <div className="flex flex-row flex-nowrap border border-gray-300 rounded-lg shadow-2xl hover:shadow-3xl transition-shadow duration-300 overflow-hidden">
        <div className="m-4">
            <div className="p-4 flex items-center justify-center">
                <Image 
                  src="/logo-ugm.png" 
                  alt="University logo" 
                  width={120} 
                  height={120} 
                  className="rounded-full"
                />
            </div>
            <div>
              <h1 className="font-extrabold text-xl ">FKKMK Universitas Gadjah Mada</h1>
            </div>
        </div>
        <div className="m-4">
          <h1 className="font-extrabold mb-4 text-lg">Login SIMDOSMA</h1>
          <form onSubmit={handleSubmit} className="flex flex-col flex-nowrap">
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-black border-solid border rounded-md m-0.5 pl-2 pt-2 pb-2 pr-8"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-black border-solid border rounded-md m-0.5 pl-2 pt-2 pb-2 pr-8"
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <button
              type="submit"
              className="bg-green-500 text-white rounded-md pt-2 pb-2 pr-32 pl-32 mt-4 hover:bg-green-700"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
