"use client"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SectionCard } from "./re-usable/Card"
import { useEffect, useState } from "react"
import { APIMaster, CountBookByTitle } from "@/utils/book"


export function SectionCards() {
    const [bookBytitle, setBookbyTitle] = useState<number>(0);
    const [catalogToday, stecatalogToday] = useState<number>(0);
    const [mycatalog, setMyCatalog] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
          const data = await APIMaster("/books/totalbooks")  // return number
          //const today = await APIMaster("/books/catalog/today") 

          //const mycatalogall = await APIMaster("/catalog/me") 

          setMyCatalog(0)
          setBookbyTitle(data)
          stecatalogToday(0)
        }
    
        fetchData()
      }, [])

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <SectionCard title={"Total Books"} desc={"Books in the System"} desc1={"Up to date Data"} total={bookBytitle} additional={catalogToday} />
      <SectionCard title={"Catalog Book"} desc={"Total of Catalog Books"} desc1={"The total book Catalog"} total={mycatalog} additional={catalogToday} />
     
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  )
}
