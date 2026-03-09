"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
 
  let headersList = {
    "Accept": "*/*",
    "User-Agent": "cataloger-app"
   }

  const res = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    body: formData,
    headers: headersList
  });

  const data = await res.json();

  const cookieStore = await cookies();

  cookieStore.set("token", data.access_token, {
    httpOnly: true,
    secure: true,
    path: "/",
  });

 

  redirect("/dashboard");
}
