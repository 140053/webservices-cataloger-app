"use client"
import { SectionCard } from "./re-usable/Card"
import { useEffect, useState } from "react"
import { APIMaster } from "@/utils/book"


export function SectionCards() {
    const [bookBytitle, setBookbyTitle] = useState<number>(0);
    const [catalogToday, stecatalogToday] = useState<number>(0);
    const [mycatalog, setMyCatalog] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
          const data = await APIMaster("/books/totalbooks")  // return number
          const today = await APIMaster("/books/catalog/today") 

          const mycatalogall = await APIMaster("/books/catalog/me") 

          setMyCatalog(mycatalogall)
          setBookbyTitle(data)
          stecatalogToday(today)
        }
    
        fetchData()
      }, [])

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <SectionCard title={"Total Books"} desc={"Books in the System"} desc1={"Up to date Data"} total={bookBytitle} additional={catalogToday} />
      <SectionCard title={"Catalog Book"} desc={"Total of Catalog Books"} desc1={"The total book Catalog"} total={mycatalog} additional={catalogToday} />
      <SectionCard title={"Pending Catalog Book"} desc={"Total of Pending Catalog Books"} desc1={"The total of pending book Catalog"} total={0} additional={0} />
      <SectionCard title={"Delete Catalog"} desc={"Total of deleted Catalog Books"} desc1={"The total of deleted book Catalog"} total={0} additional={0} />
           
    </div>
  )
}
