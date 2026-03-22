"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWorks } from "@/utils/cataloging";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search } from "lucide-react";

type Work = {
  id: number;
  title: string;
  type: "BOOK" | "THESIS" | "DISSERTATION";
  formOfWork?: string;
  dateOfWork?: number;
  summary?: string;
  createdAt: string;
};

const TYPE_BADGE: Record<string, string> = {
  BOOK: "bg-blue-100 text-blue-700",
  THESIS: "bg-purple-100 text-purple-700",
  DISSERTATION: "bg-amber-100 text-amber-700",
};

export default function WorksList() {
  const router = useRouter();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  async function load(query?: string, type?: string) {
    setLoading(true);
    try {
      const data = await getWorks(
        query || undefined,
        type && type !== "all" ? type : undefined
      );
      setWorks(data ?? []);
    } catch {
      setWorks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(q, typeFilter);
  }

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">FRBR Works</h1>
          <p className="text-sm text-stone-400">Structured catalog records — Work → Expression → Manifestation → Item</p>
        </div>
        <Button onClick={() => router.push("/dashboard/cataloging/new")}>
          <Plus className="w-4 h-4 mr-1" /> New record
        </Button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            className="pl-9"
            placeholder="Search by title…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); load(q, v); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="BOOK">Book</SelectItem>
            <SelectItem value="THESIS">Thesis</SelectItem>
            <SelectItem value="DISSERTATION">Dissertation</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {/* Table */}
      <div className="rounded-lg border border-stone-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50">
              <TableHead className="w-12 text-xs">ID</TableHead>
              <TableHead className="text-xs">Title</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-sm text-stone-400">
                  Loading…
                </TableCell>
              </TableRow>
            ) : works.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-sm text-stone-400">
                  No works found.{" "}
                  <button
                    className="text-stone-600 underline"
                    onClick={() => router.push("/dashboard/cataloging/new")}
                  >
                    Add the first one.
                  </button>
                </TableCell>
              </TableRow>
            ) : (
              works.map(w => (
                <TableRow
                  key={w.id}
                  className="cursor-pointer hover:bg-stone-50"
                  onClick={() => router.push(`/dashboard/cataloging/${w.id}`)}
                >
                  <TableCell className="font-mono text-xs text-stone-400">{w.id}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-stone-800 max-w-md truncate">{w.title}</div>
                    {w.formOfWork && <div className="text-xs text-stone-400">{w.formOfWork}</div>}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${TYPE_BADGE[w.type] ?? "bg-stone-100 text-stone-600"}`}>
                      {w.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-stone-600">{w.dateOfWork ?? "—"}</TableCell>
                  <TableCell className="text-xs text-stone-400">
                    {w.createdAt ? new Date(w.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-stone-400">{!loading && `${works.length} record${works.length !== 1 ? "s" : ""}`}</p>
    </div>
  );
}
