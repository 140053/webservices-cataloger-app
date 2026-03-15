"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
 
  let headersList = {
    "Accept": "*/*",
    "User-Agent": "cataloger-app"
   }

  const res = await fetch("http://localhost:8001/auth/login", {
    method: "POST",
    body: formData,
    headers: headersList,
    cache: "no-store",
  });

  const data = await res.json();
  //console.log("Login response:", data);

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  const cookieStore = await cookies();

  cookieStore.set("token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    //sameSite: "lax",
    path: "/",
  });

  //console.log("FULL AUTH RESPONSE:", data);
  //console.log("ACCESS TOKEN:", data.access_token);

 

  redirect("/dashboard");
}
