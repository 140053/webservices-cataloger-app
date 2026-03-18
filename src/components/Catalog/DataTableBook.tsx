"use client"

import { APIMasterDataBook } from "@/utils/book"
import { DataTable } from "../data-table"
import { useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import BookCatalogDialog, { EditBookDialog } from "./re-usable/Dialog/Edit-Book-Dialog"
import { Button } from "../ui/button"

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
      <div className="whitespace-normal break-words max-w-[300px]">
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
  {
    id: "actions", // ✅ use id instead of accessorKey
    header: "Actions",
    cell: ({ row }) => {
      const book = row.original

      return (
        <div className="flex gap-2">
          <button
            onClick={() => alert(`View ${book.bkID}`)}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            View
          </button>

         
          <BookCatalogDialog  />

          <button
            onClick={() => alert(`Delete ${book.bkID}`)}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </div>
      )
    },
  },
]

export function DataTableBook() {
  const [data, setData] = useState<Book[]>([])
 

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIMasterDataBook("/books")
      setData(res)
    }

    fetchData()
  }, [])

  return <DataTable columns={columns} data={data} />
}