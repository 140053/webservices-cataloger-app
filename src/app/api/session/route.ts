"use server"

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_API + "/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await res.json();

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Session fetch error:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}