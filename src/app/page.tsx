"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()

  router.push("/dashboard")
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full  flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
       
      </main>
    </div>
  );
}
