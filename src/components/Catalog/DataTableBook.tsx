"use client"

import { APIMasterDataBook } from "@/utils/book"
import { DataTable } from "../data-table"
import { useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"

type Book = {
  bkID: number
  Title: string
  branch: string
  entered_by: string
  tm: string
  date_entered: string
}

const columns: ColumnDef<Book>[] = [
  {
    accessorKey: "bkID",
    header: "ID",
  },
  {
    accessorKey: "Title",
    header: "Title",
    cell: ({ row }) => (
      <div className="whitespace-normal wrap-break-word max-w-100">
        {row.getValue("Title")}
      </div>
    ),
  },
  {
    accessorKey: "branch",
    header: "Branch",
  },
  {
    accessorKey: "entered_by",
    header: "Entered By",
  },
  {
    accessorKey: "tm",
    header: "Type",
  },
  {
    accessorKey: "date_entered",
    header: "Date Entered",
  },
]

export function DataTableBook() {
  const [data, setData] = useState<Book[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIMasterDataBook("/books")
      setData(res) // store API response
    }

    fetchData()
  }, [])

  return <DataTable columns={columns} data={data} />
}