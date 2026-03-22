"use client"
import { SectionCard } from "./re-usable/Card"
import { useEffect, useState } from "react"
import { APIMaster } from "@/utils/book"


export function SectionCards() {
    const [bookBytitle, setBookbyTitle] = useState<number>(0);
   

    const [mycatalog, setMyCatalog] = useState<number>(0); // book
    const [tmycatalog, settMyCatalog] = useState<number>(0); // thesis
    const [bmycatalog, setpMyCatalog] = useState<number>(0); // serials

    const [bcatalogToday, setcatalogTodayb] = useState<number>(0);
    const [tcatalogToday, setcatalogTodayt] = useState<number>(0);
    const [pcatalogToday, setcatalogTodayp] = useState<number>(0);

    

    useEffect(() => {
        const fetchData = async () => {
          const data = await APIMaster("/books/totalbooks")  // return number

          const mycatalogall = await APIMaster("/books/catalog/me", "all catalog") // all catalog by user
          const tmtotal = await APIMaster("/thesis/catalog/me", "thesis catalog")  // Thesis catalog by user
          const smtotal = await APIMaster("/serials/index/me", "serials index")  // Thesis catalog  by user

          const btoday = await APIMaster("/books/catalog/today", "book catalog today")  // Book catalog today by user 
          const ttoday = await APIMaster("/thesis/catalog/today", "thesis catalog today")  // Thesis catalog today by user
          const stoday =  await APIMaster("/serials/index/today", "serials catalog today")  // Serials catalog today by user

         
          setBookbyTitle(data)
          
          setMyCatalog(mycatalogall)
          settMyCatalog(tmtotal)          
          setpMyCatalog(smtotal)

          setcatalogTodayb(btoday)
          setcatalogTodayt(ttoday)
          setcatalogTodayp(stoday)


        }
    
        fetchData()
      }, [])

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <SectionCard title={"Total Title Books"} desc={"Books in the System"} desc1={"Up to date Data"} total={bookBytitle} additional={bcatalogToday} />
      <SectionCard title={"Catalog Book"} desc={"Total of Catalog Books"} desc1={"The total book Catalog"} total={mycatalog} additional={bcatalogToday} />
      <SectionCard title={"Catalog Thesis And Dissertation"} desc={"Catalog Thesis & Dissertation"} desc1={"Total Number of Catalog Thesis & Dissertation"} total={tmycatalog} additional={tcatalogToday} />
      <SectionCard title={"Catalog Serials"} desc={"Index Serials"} desc1={"The total of Index Serials"} total={bmycatalog} additional={pcatalogToday} />           
    </div>
  )
}
