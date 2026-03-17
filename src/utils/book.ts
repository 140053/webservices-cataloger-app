"use server";

import { cookies } from "next/headers";



export async function APIMaster(link: string){
    const token = (await cookies()).get("token")?.value;

    //console.log(token)
    if (!token) {
      throw new Error( "API Qeury error: Token");
    }

    
    try{
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
        throw new Error(data.message || "API Qeury error");
      }

      return data
    }catch(err: unknown){
      console.error("Session fetch error:", err);
      return false
    }

}


export async function APIMasterDataBook(link: string){
  const token = (await cookies()).get("token")?.value;

  //console.log(token)
  if (!token) {
    throw new Error( "API Qeury error: Token");
  }

  
  try{
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
      throw new Error(data.message || "API Qeury error");
    }

    return data
  }catch(err: unknown){
    console.error("Session fetch error:", err);
    return false
  }

}

export async function APIMasterPostWithJSON(link: string, payload: any) {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    throw new Error("API Query error: Token missing");
  }

  try {
    const res = await fetch(`${process.env.NODE_ENV_BACKEND_API}${link}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "API Query error");
    }

    return data;
  } catch (err: unknown) {
    console.error("Session POST error:", err);
    return false;
  }
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