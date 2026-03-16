"use server";

import { cookies } from "next/headers";



export async function APIMaster(link: string){
    const token = (await cookies()).get("token")?.value;

    console.log(token)
    
    const res = await fetch(process.env.NODE_ENV_BACKEND_API + link, {
        method: "GET",       
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        cache: "no-store",
      });
    
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      return data

}

export async function CountBookByTitle() {

    const token = (await cookies()).get("token")?.value;

       
      const res = await fetch(process.env.NODE_ENV_BACKEND_API + "/books/totalbooks", {
        method: "GET",       
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        cache: "no-store",
      });
    
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      return data
}


export async function CountByTitleCatalogToday(){
    const token = (await cookies()).get("token")?.value;

    const res = await fetch(process.env.NODE_ENV_BACKEND_API + "/books/totalbooks", {
        method: "GET",       
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        cache: "no-store",
      });
    
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      return data

}