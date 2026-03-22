"use client"

import { APIMasterDataBook, APIMasterDelete } from "@/utils/book"
import { useEffect, useState, useMemo } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import BookCatalogDialog from "./re-usable/Dialog/Edit-Book-Dialog"
import EditThesisDialog from "./re-usable/Dialog/Edit-Thesis-Dialog"
import EditSerialsDialog from "./re-usable/Dialog/Edit-Serials-Dialog"
import ViewCatalogDialog from "./re-usable/Dialog/View-Catalog-Dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

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

const TM_LABELS: Record<string, string> = {
  book: "Book",
  td:   "Thesis",
  pr:   "Serials",
}

const TM_BADGE: Record<string, string> = {
  book: "bg-blue-100 text-blue-700",
  td:   "bg-purple-100 text-purple-700",
  pr:   "bg-green-100 text-green-700",
}

// ─── Maintext helpers ─────────────────────────────────────────────────────────

const TAG_MAP: Record<string, string> = {
  "001":"str0","002":"str1","003":"str2","004":"str3","005":"str4",
  "006":"str5","007":"str6","008":"str7","009":"str8","0010":"str9",
  "0011":"str10","0012":"str11","0013":"str12","0014":"str13","0015":"str14",
  "0016":"str15","0017":"str16","0018":"str17","0019":"str18","0020":"str19",
  "0021":"str20","0022":"str21","0023":"str22","0024":"str23","0025":"str24",
  "0026":"str25","0027":"str26","0028":"str27",
}

function parseMaintext(maintext: string): Record<string, string> {
  const out: Record<string, string> = {}
  const re = /<(\d+)>([^<]*)/g
  let m
  while ((m = re.exec(maintext)) !== null) {
    const k = TAG_MAP[m[1]]
    if (k) out[k] = m[2].replace(/\x1E$/, "").trim()
  }
  return out
}

/** Returns { author, year, callNo } extracted per tm type */
function apaFields(tm: string, f: Record<string, string>) {
  if (tm === "book") {
    const author    = f.str3 || f.str1 || ""        // Main author, fallback creator
    const year      = f.str10 || ""                  // Year of publication
    const publisher = f.str9 || ""                   // Publisher (str9)
    const callNo    = [f.str23, f.str24].filter(Boolean).join(" ") // Prefix + call #
    return { author, year, publisher, callNo }
  }
  if (tm === "td") {
    return { author: f.str1 || "", year: f.str4 || "", publisher: f.str2 || "", callNo: f.str6 || "" }
  }
  if (tm === "pr") {
    const periodical = [f.str2, f.str3 && `vol. ${f.str3}`, f.str4].filter(Boolean).join(", ")
    return { author: f.str1 || "", year: f.str5 || "", publisher: "", callNo: periodical }
  }
  return { author: "", year: "", publisher: "", callNo: "" }
}

// ─── Export helpers ───────────────────────────────────────────────────────────

function exportCSV(rows: Book[]) {
  const headers = ["ID", "Title", "Branch", "Entered By", "Type", "Date Entered", "Copies", "On-shelf"]
  const lines = rows.map(r => [
    r.bkID,
    `"${(r.Title ?? "").replace(/"/g, '""')}"`,
    `"${r.branch ?? ""}"`,
    `"${r.entered_by ?? ""}"`,
    TM_LABELS[r.tm] ?? r.tm,
    r.date_entered ? new Date(r.date_entered).toLocaleDateString() : "",
    r.Copy,
    r.Inn,
  ].join(","))

  const csv = [headers.join(","), ...lines].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href = url
  a.download = `catalog-export-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

async function exportPDF(rows: Book[]) {
  const { default: jsPDF }    = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF({ orientation: "landscape" })
  doc.setFontSize(14)
  doc.text("Catalog Report", 14, 14)
  doc.setFontSize(9)
  doc.text(`Generated: ${new Date().toLocaleString()}  ·  Total records: ${rows.length}`, 14, 20)

  autoTable(doc, {
    startY: 25,
    head: [["ID", "Title", "Branch", "Entered By", "Type", "Date Entered", "Copies", "On-shelf"]],
    body: rows.map(r => [
      r.bkID,
      r.Title ?? "",
      r.branch ?? "",
      r.entered_by ?? "",
      TM_LABELS[r.tm] ?? r.tm,
      r.date_entered ? new Date(r.date_entered).toLocaleDateString() : "",
      r.Copy,
      r.Inn,
    ]),
    styles:     { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [28, 25, 23], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 14 },
      1: { cellWidth: 80 },
      4: { cellWidth: 18 },
      5: { cellWidth: 26 },
      6: { cellWidth: 14 },
      7: { cellWidth: 16 },
    },
    alternateRowStyles: { fillColor: [245, 243, 240] },
  })

  doc.save(`catalog-export-${Date.now()}.pdf`)
}

// ─── Delete button with confirm dialog ────────────────────────────────────────

function DeleteBookButton({ bkID, onDelete }: { bkID: number; onDelete: (id: number) => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const ok = await APIMasterDelete(`/books/${bkID}`)
    setLoading(false)
    if (ok) {
      setOpen(false)
      onDelete(bkID)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete record?</DialogTitle>
            <DialogDescription>
              This will permanently delete book ID <span className="font-mono font-semibold">{bkID}</span>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Column definitions ───────────────────────────────────────────────────────

function makeColumns(onDelete: (id: number) => void): ColumnDef<Book>[] { return [
  {
    accessorKey: "bkID",
    header: "ID",
    cell: ({ row }) => (
      <span className="text-xs font-mono text-stone-400">{row.getValue("bkID")}</span>
    ),
  },
  {
    accessorKey: "Title",
    header: "Title",
    cell: ({ row }) => {
      const book = row.original
      const f    = parseMaintext(book.Maintext ?? "")
      const { author, year, publisher, callNo } = apaFields(book.tm, f)
      return (
        <div className="whitespace-normal wrap-break-word max-w-70 space-y-0.5">
          <div className="text-sm font-medium"  >{book.Title}</div>
          <div className="text-xs text-stone-400 leading-snug">
            {author && <span className="italic">{author}</span>}
            {year   && <span> ({year}). </span>}
            {publisher && <span>{publisher}. </span>}
            {callNo && (
              <span className="font-mono text-[11px] text-stone-300">
                {book.tm === "pr" ? callNo : `· ${callNo}`}
              </span>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "tm",
    header: "Type",
    cell: ({ row }) => {
      const tm = row.getValue("tm") as string
      return (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${TM_BADGE[tm] ?? "bg-stone-100 text-stone-600"}`}>
          {TM_LABELS[tm] ?? tm}
        </span>
      )
    },
    filterFn: (row, _id, value) => value === "all" || row.getValue("tm") === value,
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => <span className="text-sm ">{row.getValue("branch")}</span>,
  },
  {
    accessorKey: "entered_by",
    header: "Entered By",
    cell: ({ row }) => <span className="text-sm ">{row.getValue("entered_by")}</span>,
  },
  {
    accessorKey: "date_entered",
    header: "Date Entered",
    cell: ({ row }) => {
      const raw = row.getValue("date_entered") as string
      return (
        <span className="text-xs ">
          {raw ? new Date(raw).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—"}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const book = row.original
      return (
        <div className="flex gap-1.5 items-center">
          <ViewCatalogDialog book={book} />
          {book.tm === "book" && <BookCatalogDialog bkID={book.bkID} maintext={book.Maintext ?? ""} />}
          {book.tm === "td"   && <EditThesisDialog  bkID={book.bkID} maintext={book.Maintext ?? ""} />}
          {book.tm === "pr"   && <EditSerialsDialog bkID={book.bkID} maintext={book.Maintext ?? ""} />}
          <DeleteBookButton bkID={book.bkID} onDelete={onDelete} />
        </div>
      )
    },
  },
]}

// ─── Main component ───────────────────────────────────────────────────────────

export function DataTableBook() {
  const [data, setData]               = useState<Book[]>([])
  const [loading, setLoading]         = useState(true)
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting]         = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [tmFilter, setTmFilter]       = useState("all")
  const [exporting, setExporting]     = useState<"pdf" | "csv" | null>(null)

  const columns = useMemo(
    () => makeColumns(id => setData(prev => prev.filter(b => b.bkID !== id))),
    []
  )

  useEffect(() => {
    APIMasterDataBook("/books").then(res => {
      setData(res ?? [])
      setLoading(false)
    })
  }, [])

  // Apply tm column filter whenever tmFilter changes
  useEffect(() => {
    setColumnFilters(prev => {
      const others = prev.filter(f => f.id !== "tm")
      return tmFilter === "all" ? others : [...others, { id: "tm", value: tmFilter }]
    })
  }, [tmFilter])

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, columnFilters, columnVisibility },
    onGlobalFilterChange:   setGlobalFilter,
    onSortingChange:        setSorting,
    onColumnFiltersChange:  setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel:        getCoreRowModel(),
    getFilteredRowModel:    getFilteredRowModel(),
    getSortedRowModel:      getSortedRowModel(),
    getPaginationRowModel:  getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const filteredRows = useMemo(
    () => table.getFilteredRowModel().rows.map(r => r.original),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table.getFilteredRowModel().rows]
  )

  async function handleExportPDF() {
    setExporting("pdf")
    await exportPDF(filteredRows)
    setExporting(null)
  }

  function handleExportCSV() {
    setExporting("csv")
    exportCSV(filteredRows)
    setExporting(null)
  }

  return (
    <div className="space-y-3">

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        {/* Left: search + type filter */}
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Search title, branch, entered by…"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="h-8 w-64 text-sm bg-white border-stone-200"
          />
          <Select value={tmFilter} onValueChange={setTmFilter}>
            <SelectTrigger className="h-8 w-36 text-sm bg-white border-stone-200">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="book">Book</SelectItem>
              <SelectItem value="td">Thesis</SelectItem>
              <SelectItem value="pr">Serials</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right: column toggle + exports */}
        <div className="flex gap-2 flex-wrap">
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs border-stone-200">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns()
                .filter(col => col.getCanHide())
                .map(col => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize text-sm"
                    checked={col.getIsVisible()}
                    onCheckedChange={v => col.toggleVisibility(!!v)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-stone-200"
            disabled={exporting === "csv"}
            onClick={handleExportCSV}
          >
            {exporting === "csv" ? "Exporting…" : "Export CSV"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-stone-200"
            disabled={exporting === "pdf"}
            onClick={handleExportPDF}
          >
            {exporting === "pdf" ? "Exporting…" : "Export PDF"}
          </Button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-md border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-250">
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-bold text-stone-500 uppercase tracking-wide cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex items-center gap-1">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-stone-300">
                          {{ asc: "↑", desc: "↓" }[header.column.getIsSorted() as string] ?? "↕"}
                        </span>
                      )}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-stone-100 rounded animate-pulse w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-gray-600 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-stone-400">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-stone-500">
        <span className="text-xs">
          {filteredRows.length} record{filteredRows.length !== 1 ? "s" : ""} found
          {data.length !== filteredRows.length && ` (filtered from ${data.length})`}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">Rows per page</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={v => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-7 w-16 text-xs border-stone-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map(n => (
                <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm"
              className="h-7 w-7 p-0 text-xs border-stone-200"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >«</Button>
            <Button
              variant="outline" size="sm"
              className="h-7 w-7 p-0 text-xs border-stone-200"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >‹</Button>
            <span className="px-2 text-xs text-stone-600">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline" size="sm"
              className="h-7 w-7 p-0 text-xs border-stone-200"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >›</Button>
            <Button
              variant="outline" size="sm"
              className="h-7 w-7 p-0 text-xs border-stone-200"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >»</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
