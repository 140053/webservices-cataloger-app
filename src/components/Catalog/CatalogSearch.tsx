"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APIMaster } from "@/utils/book";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ViewCatalogDialog, { type ViewBook } from "./re-usable/Dialog/View-Catalog-Dialog";
import BookCatalogDialog from "./re-usable/Dialog/Edit-Book-Dialog";
import EditThesisDialog from "./re-usable/Dialog/Edit-Thesis-Dialog";
import EditSerialsDialog from "./re-usable/Dialog/Edit-Serials-Dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type BookResult = ViewBook & { date_entered: string };

// ─── Maintext parser ──────────────────────────────────────────────────────────

const TAG_MAP: Record<string, string> = {
  "001":"str0","002":"str1","003":"str2","004":"str3","005":"str4",
  "006":"str5","007":"str6","008":"str7","009":"str8","0010":"str9",
  "0011":"str10","0012":"str11","0013":"str12","0014":"str13","0015":"str14",
  "0016":"str15","0017":"str16","0018":"str17","0019":"str18","0020":"str19",
  "0021":"str20","0022":"str21","0023":"str22","0024":"str23","0025":"str24",
  "0026":"str25","0027":"str26","0028":"str27","0029":"str28","0030":"str29",
  "0031":"str30","0032":"str31","0033":"str32","0034":"str33","0035":"str34",
  "0036":"str35","0037":"str36","0038":"str37","0039":"str38","0040":"str39",
  "0041":"str40","0042":"str41",
};

function parseMaintext(maintext: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /<(\d+)>([^<]*)/g;
  let m;
  while ((m = re.exec(maintext)) !== null) {
    const k = TAG_MAP[m[1]];
    if (k) out[k] = m[2].replace(/\x1E$/, "").trim();
  }
  return out;
}

// ─── APA fields per type ──────────────────────────────────────────────────────

function apaFields(tm: string, f: Record<string, string>) {
  if (tm === "book") return {
    author:    f.str3 || f.str1 || "",
    year:      f.str10 || "",
    publisher: f.str9 || "",
    callNo:    [f.str23, f.str24].filter(Boolean).join(" "),
  };
  if (tm === "td") return {
    author:    f.str1 || "",
    year:      f.str4 || "",
    publisher: f.str2 || "",                               // institution
    callNo:    f.str6 || "",
  };
  // pr
  return {
    author:    f.str1 || "",
    year:      f.str5 || "",
    publisher: "",
    callNo:    [f.str2, f.str3 && `vol. ${f.str3}`, f.str4].filter(Boolean).join(", "),
  };
}

// ─── Display constants ────────────────────────────────────────────────────────

const TM_LABELS: Record<string, string> = {
  book: "Book",
  td:   "Thesis",
  pr:   "Serials",
};

const TM_BADGE: Record<string, string> = {
  book: "bg-blue-100 text-blue-700",
  td:   "bg-purple-100 text-purple-700",
  pr:   "bg-green-100 text-green-700",
};

// ─── Column definitions ───────────────────────────────────────────────────────

const columns: ColumnDef<BookResult>[] = [
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
      const book = row.original;
      const f    = parseMaintext(book.Maintext ?? "");
      const { author, year, publisher, callNo } = apaFields(book.tm, f);
      return (
        <div className="whitespace-normal wrap-break-word max-w-80 space-y-0.5">
          <div className="text-sm font-medium">{book.Title}</div>
          <div className="text-xs text-stone-400 leading-snug">
            {author    && <span className="italic">{author}</span>}
            {year      && <span> ({year}). </span>}
            {publisher && <span>{publisher}. </span>}
            {callNo    && (
              <span className="font-mono text-[11px] text-stone-300">
                {book.tm === "pr" ? callNo : `· ${callNo}`}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "tm",
    header: "Type",
    cell: ({ row }) => {
      const tm = row.getValue("tm") as string;
      return (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${TM_BADGE[tm] ?? "bg-stone-100 text-stone-600"}`}>
          {TM_LABELS[tm] ?? tm}
        </span>
      );
    },
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => <span className="text-sm text-stone-600">{row.getValue("branch")}</span>,
  },
  {
    accessorKey: "Copy",
    header: "Copies",
    cell: ({ row }) => {
      const book = row.original;
      return (
        <div className="text-xs text-center space-y-0.5">
          <div><span className="text-stone-400">Total </span><span className="font-bold">{book.Copy}</span></div>
          <div><span className="text-stone-400">Shelf </span><span className="font-bold text-emerald-600">{book.Inn}</span></div>
        </div>
      );
    },
  },
  {
    accessorKey: "date_entered",
    header: "Date Entered",
    cell: ({ row }) => {
      const raw = row.getValue("date_entered") as string;
      return (
        <span className="text-xs text-stone-400">
          {raw ? new Date(raw).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const book = row.original;
      return (
        <div className="flex gap-1.5 items-center">
          <ViewCatalogDialog book={book as ViewBook} />
          {book.tm === "book" && <BookCatalogDialog bkID={book.bkID} maintext={book.Maintext ?? ""} />}
          {book.tm === "td"   && <EditThesisDialog  bkID={book.bkID} maintext={book.Maintext ?? ""} />}
          {book.tm === "pr"   && <EditSerialsDialog bkID={book.bkID} maintext={book.Maintext ?? ""} />}
        </div>
      );
    },
  },
];

// ─── Card view ───────────────────────────────────────────────────────────────

const TM_HEADER_COLOR: Record<string, string> = {
  book: "bg-stone-900",
  td:   "bg-[#1e1b4b]",
  pr:   "bg-[#14532d]",
};

const TM_COLORS: Record<string, string> = {
  book: "border-stone-500 text-stone-300",
  td:   "border-purple-500 text-purple-300",
  pr:   "border-green-500 text-green-300",
};

function BookFields({ f }: { f: Record<string, string> }) {
  const Row = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div className="grid grid-cols-[150px_1fr] gap-2 py-1.5 border-b border-stone-100 last:border-0 text-sm">
        <span className="text-stone-400 font-semibold shrink-0">{label}</span>
        <span className="text-stone-800 wrap-break-word">{value}</span>
      </div>
    ) : null;
  return (
    <>
      <Row label="Author / Creator"   value={f.str3} />
      <Row label="Corporate Body"     value={f.str7} />
      <Row label="Publisher"          value={f.str9} />
      <Row label="Place of Pub."      value={f.str8} />
      <Row label="Year"               value={f.str10} />
      <Row label="Edition"            value={f.str11} />
      <Row label="Extent / Pages"     value={f.str12} />
      <Row label="Series"             value={f.str16} />
      <Row label="ISBN"               value={f.str18} />
      <Row label="Call Number"        value={[f.str23, f.str24].filter(Boolean).join(" ") || undefined} />
      <Row label="Accession"          value={f.str25} />
      <Row label="Language"           value={f.str26} />
      <Row label="Location"           value={f.str27} />
      <Row label="Subject — Topical"  value={f.str19} />
      <Row label="General Notes"      value={f.str17} />
      <Row label="Summary"            value={f.str33} />
    </>
  );
}

function ThesisFields({ f }: { f: Record<string, string> }) {
  const Row = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div className="grid grid-cols-[150px_1fr] gap-2 py-1.5 border-b border-stone-100 last:border-0 text-sm">
        <span className="text-stone-400 font-semibold shrink-0">{label}</span>
        <span className="text-stone-800 wrap-break-word">{value}</span>
      </div>
    ) : null;
  return (
    <>
      <Row label="Creator(s)"         value={f.str1} />
      <Row label="Institution"        value={f.str2} />
      <Row label="Course / Program"   value={f.str3} />
      <Row label="Date / Year"        value={f.str4} />
      <Row label="Type of Work"       value={f.str16} />
      <Row label="Keywords"           value={f.str11} />
      <Row label="Call Number"        value={f.str6} />
      <Row label="Accession"          value={f.str7} />
      <Row label="Language"           value={f.str8} />
      <Row label="Location"           value={f.str9} />
      <Row label="Abstract"           value={f.str12} />
    </>
  );
}

function SerialsFields({ f }: { f: Record<string, string> }) {
  const Row = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div className="grid grid-cols-[150px_1fr] gap-2 py-1.5 border-b border-stone-100 last:border-0 text-sm">
        <span className="text-stone-400 font-semibold shrink-0">{label}</span>
        <span className="text-stone-800 wrap-break-word">{value}</span>
      </div>
    ) : null;
  return (
    <>
      <Row label="Author(s)"          value={f.str1} />
      <Row label="Periodical Title"   value={f.str2} />
      <Row label="Volume"             value={f.str3} />
      <Row label="Issue / Number"     value={f.str4} />
      <Row label="Date"               value={f.str5} />
      <Row label="Pages"              value={f.str6} />
      <Row label="Type of Article"    value={f.str7} />
      <Row label="Language"           value={f.str8} />
      <Row label="Location"           value={f.str9} />
      <Row label="Electronic Access"  value={f.str10} />
      <Row label="Keywords"           value={f.str11} />
      <Row label="Abstract"           value={f.str12} />
    </>
  );
}

function ResultCard({ result }: { result: BookResult }) {
  const [expanded, setExpanded] = useState(false);
  const f = parseMaintext(result.Maintext ?? "");
  const { author, year, publisher, callNo } = apaFields(result.tm, f);
  const headerColor = TM_HEADER_COLOR[result.tm] ?? "bg-stone-900";
  const badgeColor  = TM_COLORS[result.tm]       ?? "border-stone-500 text-stone-300";

  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-4 flex items-start justify-between gap-4 ${headerColor}`}>
        <div className="flex-1 min-w-0">
          <Badge variant="outline" className={`mb-1.5 text-[10px] tracking-widest uppercase bg-transparent border ${badgeColor}`}>
            {TM_LABELS[result.tm] ?? result.tm}
          </Badge>
          <h3 className="text-white text-sm font-bold leading-snug wrap-break-word">{result.Title}</h3>
          <p className="text-stone-400 text-xs mt-0.5 leading-snug">
            {author    && <span className="italic">{author}</span>}
            {year      && <span> ({year}). </span>}
            {publisher && <span>{publisher}. </span>}
            {callNo    && <span className="font-mono text-[11px] text-stone-500">· {callNo}</span>}
          </p>
          <p className="text-stone-500 text-[11px] mt-1">
            ID: {result.bkID} · {result.branch} · {result.entered_by}
          </p>
        </div>
        <div className="shrink-0 flex flex-col gap-1.5 pt-0.5">
          <ViewCatalogDialog book={result as ViewBook} />
          {result.tm === "book" && <BookCatalogDialog bkID={result.bkID} maintext={result.Maintext ?? ""} />}
          {result.tm === "td"   && <EditThesisDialog  bkID={result.bkID} maintext={result.Maintext ?? ""} />}
          {result.tm === "pr"   && <EditSerialsDialog bkID={result.bkID} maintext={result.Maintext ?? ""} />}
        </div>
      </div>

      {/* Holdings strip */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 px-5 py-2 bg-stone-50 border-b border-stone-200 text-xs text-stone-500">
        <span>Copies: <span className="text-stone-800 font-bold">{result.Copy}</span></span>
        <span>On-shelf: <span className="text-stone-800 font-bold">{result.Inn}</span></span>
        {result.restricted && <span className="text-red-600 font-semibold">RESTRICTED</span>}
        {result.coding && <span>Coding: <span className="text-stone-700">{result.coding}</span></span>}
      </div>

      {/* Expand / collapse */}
      <button
        className="w-full text-left px-5 py-2 text-xs text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        {expanded ? "▲ Hide details" : "▼ Show details"}
      </button>

      {expanded && (
        <div className="px-5 py-3 border-t border-stone-100">
          {result.tm === "book" && <BookFields   f={f} />}
          {result.tm === "td"   && <ThesisFields  f={f} />}
          {result.tm === "pr"   && <SerialsFields f={f} />}
        </div>
      )}
    </div>
  );
}

// ─── Results table ────────────────────────────────────────────────────────────

function ResultsTable({ data }: { data: BookResult[] }) {
  const [sorting, setSorting]               = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange:          setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel:          getCoreRowModel(),
    getFilteredRowModel:      getFilteredRowModel(),
    getSortedRowModel:        getSortedRowModel(),
    getPaginationRowModel:    getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const totalFiltered = useMemo(() => table.getFilteredRowModel().rows.length, [data]);

  return (
    <div className="space-y-3">

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-stone-400">
          {totalFiltered} result{totalFiltered !== 1 ? "s" : ""}
          {totalFiltered === 50 && " (showing first 50 — refine your query for more)"}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs border-stone-200">
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
      </div>

      {/* Table */}
      <div className="rounded-md border border-stone-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-stone-50">
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-stone-50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-20 text-center text-sm text-stone-400">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-stone-500">
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
              {[10, 25, 50].map(n => (
                <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-xs border-stone-200"
            onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>«</Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-xs border-stone-200"
            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>‹</Button>
          <span className="px-2 text-xs text-stone-600">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-xs border-stone-200"
            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>›</Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-xs border-stone-200"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>»</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CatalogSearch() {
  const [query, setQuery]       = useState("");
  const [tmFilter, setTmFilter] = useState("all");
  const [results, setResults]   = useState<BookResult[] | undefined>(undefined);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setLoading(true);
    setResults(undefined);
    try {
      const params = new URLSearchParams({ q, limit: "50" });
      if (tmFilter !== "all") params.set("tm", tmFilter);
      const data = await APIMaster(`/books/search?${params}`, "search");
      setResults(Array.isArray(data) ? data : []);
      setSearched(q);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 lg:px-6 space-y-5">

      {/* ── Search bar ── */}
      <form onSubmit={handleSearch} className="flex gap-2 flex-wrap max-w-3xl">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search title, author, subject, keyword…"
          className="bg-white border-stone-200 text-sm flex-1 min-w-48"
        />
        <Select value={tmFilter} onValueChange={setTmFilter}>
          <SelectTrigger className="h-9 w-36 text-sm bg-white border-stone-200">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="book">Book</SelectItem>
            <SelectItem value="td">Thesis</SelectItem>
            <SelectItem value="pr">Serials</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={loading} className="bg-stone-900 text-white hover:bg-stone-700 shrink-0">
          {loading ? "Searching…" : "Search"}
        </Button>
      </form>

      {/* ── Skeleton while loading ── */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-md bg-stone-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty prompt ── */}
      {results === undefined && !loading && (
        <p className="text-sm text-stone-400 italic">Enter a keyword to search title, author, subject, and more.</p>
      )}

      {/* ── No results ── */}
      {results && results.length === 0 && (
        <div className="max-w-2xl rounded-lg border border-stone-200 bg-stone-50 px-6 py-10 text-center">
          <p className="text-stone-500 text-sm font-medium">
            No records found for{" "}
            <span className="text-stone-800">"{searched}"</span>
            {tmFilter !== "all" && (
              <span> in <Badge className={`ml-1 text-[11px] ${TM_BADGE[tmFilter]}`}>{TM_LABELS[tmFilter]}</Badge></span>
            )}
          </p>
        </div>
      )}

      {/* ── Results ── */}
      {results && results.length > 0 && (
        <div className="space-y-3">
          {/* View toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400">
              {results.length} result{results.length !== 1 ? "s" : ""}
              {results.length === 50 && " · showing first 50"}
            </span>
            <div className="flex rounded-md border border-stone-200 overflow-hidden text-xs font-medium">
              <button
                onClick={() => setViewMode("card")}
                className={`px-3 py-1.5 transition-colors ${viewMode === "card" ? "bg-stone-900 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
              >
                ▦ Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 border-l border-stone-200 transition-colors ${viewMode === "table" ? "bg-stone-900 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
              >
                ≡ Table
              </button>
            </div>
          </div>

          {viewMode === "card" && (
            <div className="space-y-3 max-w-3xl">
              {results.map(r => <ResultCard key={r.bkID} result={r} />)}
            </div>
          )}

          {viewMode === "table" && <ResultsTable data={results} />}
        </div>
      )}
    </div>
  );
}
