"use client"

import { APIMasterDataBook } from "@/utils/book"
import { DataTable } from "../data-table"
import { useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import BookCatalogDialog from "./re-usable/Dialog/Edit-Book-Dialog"
import EditThesisDialog from "./re-usable/Dialog/Edit-Thesis-Dialog"
import EditSerialsDialog from "./re-usable/Dialog/Edit-Serials-Dialog"
import ViewCatalogDialog from "./re-usable/Dialog/View-Catalog-Dialog"

type Book = {
  bkID: number
  Title: string
  branch: string
  entered_by: string
  date_entered: string
  updated_by?: string
  date_updated?: string
  tm: string
  Maintext: string
  Copy: number
  Inn: number
  t_Out: number
  t_TimesOut: number
  restricted: boolean
  coding?: string | null
  acquisitionmode?: string | null
  donor?: string | null
  gc: number; tr: number; easy: number; circ: number
  fr: number; sm: number; schl: number
  Fil: number; Ref: number; Bio: number; Fic: number; Res: number
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
          <ViewCatalogDialog book={book} />

         
          {book.tm === "book" && <BookCatalogDialog bkID={book.bkID} maintext={book.Maintext ?? ""} />}
          {book.tm === "td"   && <EditThesisDialog  bkID={book.bkID} maintext={book.Maintext ?? ""} />}
          {book.tm === "pr"   && <EditSerialsDialog bkID={book.bkID} maintext={book.Maintext ?? ""} />}

          <button
            onClick={() => alert(`Delete ${book.bkID}`)}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hidden"
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