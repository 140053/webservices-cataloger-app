"use server";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function logoutUser() {
  (await cookies()).delete("session");
}


export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const res = await fetch("http://127.0.0.1:8001/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const user = await res.json();

    return user;
  } catch (err) {
    console.error("Session fetch error:", err);
    return null;
  }
}