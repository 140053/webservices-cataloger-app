"use client"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"

  type SectionParams = {
    title: String,
    total: number,
    additional: number,
    desc: String,
    desc1: String

  }
  
  export function SectionCard({title,total, additional, desc, desc1}:SectionParams) {
    
  
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {total.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="">
              <IconTrendingUp />
              +{additional}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {desc} <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
           {desc1}
          </div>
        </CardFooter>
      </Card>
    )
  }