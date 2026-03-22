"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ViewBook = {
  bkID: number;
  Title: string;
  Maintext: string;
  tm: string;
  branch: string;
  entered_by: string;
  date_entered: string;
  updated_by?: string;
  date_updated?: string;
  Copy: number;
  Inn: number;
  t_Out: number;
  t_TimesOut: number;
  restricted: boolean;
  coding?: string | null;
  acquisitionmode?: string | null;
  donor?: string | null;
  // collection flags
  gc: number; tr: number; easy: number; circ: number;
  fr: number;  sm: number;  schl: number;
  Fil: number; Ref: number; Bio: number; Fic: number; Res: number;
};

// ─── Maintext parser ──────────────────────────────────────────────────────────

const TAG_MAP: Record<string, string> = {
  "001": "str0",  "002": "str1",  "003": "str2",  "004": "str3",
  "005": "str4",  "006": "str5",  "007": "str6",  "008": "str7",
  "009": "str8",  "0010": "str9", "0011": "str10","0012": "str11",
  "0013": "str12","0014": "str13","0015": "str14","0016": "str15",
  "0017": "str16","0018": "str17","0019": "str18","0020": "str19",
  "0021": "str20","0022": "str21","0023": "str22","0024": "str23",
  "0025": "str24","0026": "str25","0027": "str26","0028": "str27",
  "0029": "str28","0030": "str29","0031": "str30","0032": "str31",
  "0033": "str32","0034": "str33","0035": "str34","0036": "str35",
  "0037": "str36","0038": "str37","0039": "str38","0040": "str39",
  "0041": "str40","0042": "str41",
};

function parseMaintext(maintext: string): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /<(\d+)>([^<]*)/g;
  let match;
  while ((match = regex.exec(maintext)) !== null) {
    const key = TAG_MAP[match[1]];
    if (key) result[key] = match[2].replace(/\x1E$/, "").trim();
  }
  return result;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

const TM_LABELS: Record<string, string> = {
  book: "Book",
  td:   "Thesis / Academic Work",
  pr:   "Periodical Article",
};

const TM_HEADER_COLOR: Record<string, string> = {
  book: "bg-stone-900",
  td:   "bg-[#1e1b4b]",
  pr:   "bg-[#14532d]",
};

const TM_BADGE_COLOR: Record<string, string> = {
  book: "border-stone-500 text-stone-300",
  td:   "border-purple-500 text-purple-300",
  pr:   "border-green-500 text-green-300",
};

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[180px_1fr] gap-2 py-2 border-b border-stone-100 last:border-0 text-sm">
      <span className="text-stone-400 font-semibold shrink-0">{label}</span>
      <span className="text-stone-800 break-words">{value}</span>
    </div>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="bg-stone-100 px-4 py-1.5 -mx-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 border-y border-stone-200 mt-4 first:mt-0">
      {label}
    </div>
  );
}

// ─── Per-type field renderers ─────────────────────────────────────────────────

function BookDetails({ f }: { f: Record<string, string> }) {
  return (
    <>
      <SectionHeading label="Title & Authorship" />
      <DetailRow label="Title"                value={f.str0} />
      <DetailRow label="Statement of Resp."   value={f.str1} />
      <DetailRow label="Parallel Title"       value={f.str2} />
      <DetailRow label="Main Author"          value={f.str3} />
      <DetailRow label="Numeration"           value={f.str4} />
      <DetailRow label="Other Author"         value={f.str5} />
      <DetailRow label="Contributors"         value={f.str6} />
      <DetailRow label="Corporate Body"       value={f.str7} />
      <DetailRow label="Variant Title"        value={f.str36} />

      <SectionHeading label="Publication" />
      <DetailRow label="Place of Publication" value={f.str8} />
      <DetailRow label="Publisher"            value={f.str9} />
      <DetailRow label="Year"                 value={f.str10} />
      <DetailRow label="Edition"              value={f.str11} />
      <DetailRow label="Extent / Pages"       value={f.str12} />
      <DetailRow label="Illustrations"        value={f.str13} />
      <DetailRow label="Dimensions"           value={f.str14} />
      <DetailRow label="Accompanying Mat."    value={f.str15} />
      <DetailRow label="Series"               value={f.str16} />
      <DetailRow label="ISBN"                 value={f.str18} />

      <SectionHeading label="Access Points / Subjects" />
      <DetailRow label="Subject — Topical"    value={f.str19} />
      <DetailRow label="Subject — Personal"   value={f.str20} />
      <DetailRow label="Subject — Corporate"  value={f.str21} />
      <DetailRow label="Subject — Geographic" value={f.str22} />

      <SectionHeading label="Library & Physical" />
      <DetailRow label="Prefix"               value={f.str23} />
      <DetailRow label="Call Number"          value={f.str24} />
      <DetailRow label="Accession"            value={f.str25} />
      <DetailRow label="Language"             value={f.str26} />
      <DetailRow label="Location"             value={f.str27} />
      <DetailRow label="Electronic Access"    value={f.str28} />
      <DetailRow label="Content Type"         value={f.str38} />
      <DetailRow label="Media Type"           value={f.str39} />
      <DetailRow label="Carrier Type"         value={f.str40} />

      <SectionHeading label="Notes" />
      <DetailRow label="General Notes"        value={f.str17} />
      <DetailRow label="Content"              value={f.str32} />
      <DetailRow label="Summary"              value={f.str33} />
      <DetailRow label="Abstract"             value={f.str34} />
      <DetailRow label="URL"                  value={f.str37} />
    </>
  );
}

function ThesisDetails({ f }: { f: Record<string, string> }) {
  return (
    <>
      <SectionHeading label="Title & Creators" />
      <DetailRow label="Title"                value={f.str0} />
      <DetailRow label="Creator(s) / Author(s)" value={f.str1} />

      <SectionHeading label="Institution & Type" />
      <DetailRow label="Institution"          value={f.str2} />
      <DetailRow label="Course / Program"     value={f.str3} />
      <DetailRow label="Date / Year"          value={f.str4} />
      <DetailRow label="Type of Work"         value={f.str16} />
      <DetailRow label="Subjects / Keywords"  value={f.str11} />

      <SectionHeading label="Physical Details" />
      <DetailRow label="Extent of Material"   value={f.str5} />
      <DetailRow label="Illustrative Details" value={f.str17} />
      <DetailRow label="Dimension"            value={f.str18} />
      <DetailRow label="Supplementary"        value={f.str19} />

      <SectionHeading label="Library & Access" />
      <DetailRow label="Call Number"          value={f.str6} />
      <DetailRow label="Accession"            value={f.str7} />
      <DetailRow label="Language"             value={f.str8} />
      <DetailRow label="Location"             value={f.str9} />
      <DetailRow label="Electronic Access"    value={f.str10} />

      <SectionHeading label="Abstract" />
      <DetailRow label="Abstract"             value={f.str12} />
    </>
  );
}

function SerialsDetails({ f }: { f: Record<string, string> }) {
  return (
    <>
      <SectionHeading label="Article & Authors" />
      <DetailRow label="Article Title"        value={f.str0} />
      <DetailRow label="Creator(s) / Author(s)" value={f.str1} />

      <SectionHeading label="Periodical Details" />
      <DetailRow label="Periodical Title"     value={f.str2} />
      <DetailRow label="Volume"               value={f.str3} />
      <DetailRow label="Issue / Number"       value={f.str4} />
      <DetailRow label="Date"                 value={f.str5} />
      <DetailRow label="Pages"                value={f.str6} />

      <SectionHeading label="Classification" />
      <DetailRow label="Type of Article"      value={f.str7} />
      <DetailRow label="Language"             value={f.str8} />

      <SectionHeading label="Access & Location" />
      <DetailRow label="Location"             value={f.str9} />
      <DetailRow label="Electronic Access"    value={f.str10} />

      <SectionHeading label="Abstract & Keywords" />
      <DetailRow label="Subject / Keywords"   value={f.str11} />
      <DetailRow label="Abstract"             value={f.str12} />
    </>
  );
}

// ─── Collection flags ─────────────────────────────────────────────────────────

function CollectionFlags({ book }: { book: ViewBook }) {
  const flags = [
    { key: "gc",   label: "General Circ.",  active: !!book.gc },
    { key: "circ", label: "Circulation",    active: !!book.circ },
    { key: "tr",   label: "Teacher Ref.",   active: !!book.tr },
    { key: "fr",   label: "Filipiniana",    active: !!book.fr },
    { key: "Ref",  label: "Reference",      active: !!book.Ref },
    { key: "Fil",  label: "Filipiniana Ref",active: !!book.Fil },
    { key: "sm",   label: "Special",        active: !!book.sm },
    { key: "Bio",  label: "Biography",      active: !!book.Bio },
    { key: "Res",  label: "Reserve",        active: !!book.Res },
    { key: "schl", label: "Scholastic",     active: !!book.schl },
    { key: "easy", label: "Easy",           active: !!book.easy },
    { key: "Fic",  label: "Fiction",        active: !!book.Fic },
  ].filter(f => f.active);

  if (!flags.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {flags.map(f => (
        <span key={f.key} className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
          {f.label}
        </span>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ViewCatalogDialogProps {
  book: ViewBook;
}

export default function ViewCatalogDialog({ book }: ViewCatalogDialogProps) {
  const [open, setOpen] = useState(false);
  const f = parseMaintext(book.Maintext ?? "");
  const headerColor = TM_HEADER_COLOR[book.tm] ?? "bg-stone-900";
  const badgeColor  = TM_BADGE_COLOR[book.tm]  ?? "border-stone-500 text-stone-300";

  const dateEntered = book.date_entered
    ? new Date(book.date_entered).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
    : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="px-2 py-1 text-xs border-blue-200 text-blue-600 hover:bg-blue-50">
          View
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "max-w-3xl w-[95vw] p-0 gap-0 overflow-hidden",
          "bg-white border border-stone-200 shadow-2xl rounded-xl",
          "max-h-[95dvh] flex flex-col",
        )}
      >
        {/* ── Header ── */}
        <DialogHeader className={cn(headerColor, "px-6 pt-5 pb-4 shrink-0")}>
          <Badge
            variant="outline"
            className={cn("mb-2 w-fit text-[10px] tracking-widest uppercase bg-transparent border", badgeColor)}
          >
            {TM_LABELS[book.tm] ?? book.tm}
          </Badge>
          <DialogTitle className="text-white text-lg font-bold leading-snug">
            {book.Title}
          </DialogTitle>
          <DialogDescription className="text-stone-400 text-xs mt-1 space-y-0.5">
            <span>ID: {book.bkID}</span>
            <span className="mx-2">·</span>
            <span>Branch: {book.branch}</span>
            <span className="mx-2">·</span>
            <span>Entered by: {book.entered_by}</span>
            {dateEntered && <><span className="mx-2">·</span><span>{dateEntered}</span></>}
          </DialogDescription>
        </DialogHeader>

        {/* ── Holdings strip ── */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 px-6 py-3 bg-stone-50 border-b border-stone-200 text-xs font-medium text-stone-500 shrink-0">
          <span>Copies: <span className="text-stone-800 font-bold">{book.Copy}</span></span>
          <span>On-shelf: <span className="text-stone-800 font-bold">{book.Inn}</span></span>
          <span>Times out: <span className="text-stone-800 font-bold">{book.t_TimesOut}</span></span>
          {book.restricted && <span className="text-red-600 font-semibold">RESTRICTED</span>}
          {book.coding && <span>Coding: <span className="text-stone-800">{book.coding}</span></span>}
          {book.acquisitionmode && <span>Acquired: <span className="text-stone-800">{book.acquisitionmode}</span></span>}
          {book.donor && <span>Donor: <span className="text-stone-800">{book.donor}</span></span>}
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-4">

          {/* Collection flags — only for books */}
          {book.tm === "book" && (
            <div className="mb-4">
              <CollectionFlags book={book} />
            </div>
          )}

          {book.tm === "book" && <BookDetails   f={f} />}
          {book.tm === "td"   && <ThesisDetails  f={f} />}
          {book.tm === "pr"   && <SerialsDetails f={f} />}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-6 py-3 border-t border-stone-100 bg-stone-50 flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} className="border-stone-300 text-stone-600">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
