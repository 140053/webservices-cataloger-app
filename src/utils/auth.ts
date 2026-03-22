"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const headersList = {
    "Accept": "*/*",
    "User-Agent": "cataloger-app",
  }

  let data: { access_token?: string; detail?: string; message?: string }
  try {
    const res = await fetch(process.env.NODE_ENV_BACKEND_API + "/auth/login", {
      method: "POST",
      body: formData,
      headers: headersList,
      cache: "no-store",
    })
    data = await res.json()
    if (!res.ok) {
      return { error: data.detail || data.message || "Invalid credentials" }
    }
  } catch {
    return { error: "Unable to reach the server. Please try again." }
  }

  const cookieStore = await cookies()
  cookieStore.set("token", data.access_token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })

  redirect("/dashboard")
}
