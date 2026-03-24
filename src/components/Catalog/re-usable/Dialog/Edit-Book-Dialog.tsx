"use client";

import { APIMasterPostWithJSON, APIMasterPutWithJSON } from "@/utils/book";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/useSession";

// ─── Types ────────────────────────────────────────────────────────────────────

type BookForm = {
  str0: string;   // Title
  str1: string;   // Statement of responsibility
  str2: string;   // Parallel title
  str3: string;   // Main author / creator
  str4: string;   // Numeration
  str5: string;   // Other author
  str6: string;   // Contributors / editors
  str7: string;   // Corporate body
  str8: string;   // Place of publication
  str9: string;   // Publisher
  str10: string;  // Year of publication
  str11: string;  // Edition
  str12: string;  // Extent / pages
  str13: string;  // Other details / illustrations
  str14: string;  // Dimensions
  str15: string;  // Accompanying materials
  str16: string;  // Series
  str17: string;  // General notes
  str18: string;  // ISBN
  str19: string;  // Access point – Topical
  str20: string;  // Access point – Personal
  str21: string;  // Access point – Corporate
  str22: string;  // Access point – Geographical
  str23: string;  // Prefix
  str24: string;  // Call number
  str25: string;  // Accession number
  str26: string;  // Language
  str27: string;  // Location / branch
  str28: string;  // Filename / Electronic access
  str29: string;  // Copy count
  str30: string;  // Inn
  str31: string;  // Out
  str32: string;  // content
  str33: string;  // summary
  str34: string;  // abstract
  str35: string;  // times out
  str36: string;  // Variant title
  str37: string;  // URL
  str38: string;  // Content type
  str39: string;  // Media type
  str40: string;  // Carrier type
  str41: string;  // Cover image filename
  str42: string;
  gc: boolean;
  tref: boolean;
  fr: boolean;
  circ: boolean;
  ref: boolean;
  fil: boolean;
  sp: boolean;
  bio: boolean;
  res: boolean;
  schl: boolean;
  easy: boolean;
  fic: boolean;
  con: boolean;
  strAcquisitionMode: string;
  strDonor: string;
  strCoding: string;
  bkID: string;
  isUpdate: boolean;
};

const defaultForm: BookForm = {
  str0: "", str1: "", str2: "", str3: "", str4: "", str5: "", str6: "",
  str7: "", str8: "", str9: "", str10: "", str11: "", str12: "", str13: "",
  str14: "", str15: "", str16: "", str17: "", str18: "", str19: "", str20: "",
  str21: "", str22: "", str23: "", str24: "", str25: "", str26: "English",
  str27: "CIRCULATION", str28: "", str29: "1", str30: "1", str31: "0",
  str32: "", str33: "", str34: "", str35: "0", str36: "", str37: "",
  str38: "Text", str39: "Unmediated", str40: "Volume", str41: "", str42: "",
  gc: false, tref: false, fr: false, circ: true, ref: false, fil: false,
  sp: false, bio: false, res: false, schl: false, easy: false, fic: false,
  con: false, strAcquisitionMode: "", strDonor: "", strCoding: "",
  bkID: "", isUpdate: false,
};

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Title & Authorship",   icon: "01", short: "Title" },
  { label: "Publication",          icon: "02", short: "Publication" },
  { label: "Access Points",        icon: "03", short: "Subjects" },
  { label: "Physical Description", icon: "04", short: "Physical" },
  { label: "Library & Access",     icon: "05", short: "Library" },
  { label: "Notes & Acquisition",  icon: "06", short: "Notes" },
  { label: "Review & Submit",      icon: "07", short: "Review" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMaintext(form: BookForm): string {
  const pairs: [string, string][] = [
    ["001", form.str0], ["002", form.str1], ["003", form.str2],
    ["004", form.str3], ["005", form.str4], ["006", form.str5],
    ["007", form.str6], ["008", form.str7], ["009", form.str8],
    ["0010", form.str9], ["0011", form.str10], ["0012", form.str11],
    ["0013", form.str12], ["0014", form.str13], ["0015", form.str14],
    ["0016", form.str15], ["0017", form.str16], ["0018", form.str17],
    ["0019", form.str18], ["0020", form.str19], ["0021", form.str20],
    ["0022", form.str21], ["0023", form.str22], ["0024", form.str23],
    ["0025", form.str24], ["0026", form.str25], ["0027", form.str26],
    ["0028", form.str27], ["0029", form.str28], ["0030", form.str29],
    ["0031", form.str30], ["0032", form.str31], ["0033", form.str32],
    ["0034", form.str33], ["0035", form.str34], ["0036", form.str35],
    ["0037", form.str36], ["0038", form.str37], ["0039", form.str38],
    ["0040", form.str39], ["0041", form.str40], ["0042", form.str41],
  ];
  return pairs.map(([tag, val]) => `<${tag}>${val.trim()}`).join("").replace(/\\/g, "/");
}

function buildPayload(form: BookForm, branch: string, enteredBy: string, date_entered:string, updatedBy: string) {
  const title = form.str0;
  const maintext = buildMaintext(form).replace(/"/g, "").replace(/'/g, "`");
  const now = new Date().toISOString();
  return {
    Title: title, Maintext: maintext,
    Fil: form.fil ? 1 : 0, Ref: form.ref ? 1 : 0, Bio: form.bio ? 1 : 0,
    Fic: form.fic ? 1 : 0, Res: form.res ? 1 : 0,
    Copy: parseInt(form.str29) || 0, Inn: parseInt(form.str30) || 0,
    t_Out: 0, t_TimesOut: 0, images: form.str41 || null, tm: "book",
    gc: form.gc ? 1 : 0, tr: form.tref ? 1 : 0, easy: form.easy ? 1 : 0,
    circ: form.circ ? 1 : 0, fr: form.fr ? 1 : 0,
    sm: form.sp ? 1 : 0,
    entered_by: enteredBy, 
    date_entered: date_entered, 
    updated_by: updatedBy,
    schl: form.schl ? 1 : 0,
    acquisitionmode: form.strAcquisitionMode || null,
    donor: form.strDonor || null, branch: branch,
    restricted: form.con ? 1 : 0, filsts: null, coding: form.strCoding || null,
    ...(form.isUpdate ? { bkID: form.bkID, date_updated: now } : {}),
  };
}

// ─── Reusable field components ────────────────────────────────────────────────

function FormField({
  label, name, value, onChange, required, hint, placeholder,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; hint?: string; placeholder?: string;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr]  gap-y-1 items-start">
      <Label htmlFor={name} className="text-sm font-semibold text-stone-600 pt-2.5 leading-tight">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="block text-[10px] font-normal text-stone-400 italic">{hint}</span>}
      </Label>
      <Input
        id={name} name={name} value={value} onChange={onChange}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        className="h-9 bg-stone-50 border-stone-200 focus:border-stone-400 focus:ring-stone-300 text-sm font-medium text-stone-800 placeholder:text-stone-300 rounded-md"
      />
    </div>
  );
}

function FormTextArea({
  label, name, value, onChange, hint, rows = 4,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  hint?: string; rows?: number;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-x-4 gap-y-1 items-start">
      <Label htmlFor={name} className="text-sm font-semibold text-stone-600 pt-2.5 leading-tight">
        {label}
        {hint && <span className="block text-[10px] font-normal text-stone-400 italic">{hint}</span>}
      </Label>
      <Textarea
        id={name} name={name} value={value} onChange={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        rows={rows}
        className="bg-stone-50 border-stone-200 focus:border-stone-400 focus:ring-stone-300 text-sm font-medium text-stone-800 placeholder:text-stone-300 resize-y rounded-md min-h-22.5"
      />
    </div>
  );
}

function FormSelect({
  label, name, value, onChange, options, hint,
}: {
  label: string; name: string; value: string;
  onChange: (val: string) => void;
  options: string[]; hint?: string;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr]  gap-y-1 items-start ">
      <Label className="text-sm font-semibold text-stone-600 pt-2.5 leading-tight">
        {label}
        {hint && <span className="block text-[10px] font-normal text-stone-400 italic">{hint}</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-15 bg-stone-50 border-stone-200 text-sm font-medium text-stone-800 rounded-md w-full">
          <SelectValue placeholder="— select —" />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o} value={o || "__empty__"} className="text-sm">
              {o || "— select —"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function FormCheckbox({
  id, label, checked, onChange,
}: {
  id: string; label: string; checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2.5 cursor-pointer group"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="border-stone-300 data-[state=checked]:bg-stone-700 data-[state=checked]:border-stone-700 rounded"
      />
      <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors select-none">
        {label}
      </span>
    </label>
  );
}

function PreviewRow({ label, value }: { label: string; value: string | boolean | number }) {
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  if (!display || display === "false" || display === "No" || display === "0") return null;
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 px-4 py-2 border-b border-stone-100 last:border-0 text-sm">
      <span className="text-stone-400 font-semibold">{label}</span>
      <span className="text-stone-700 wrap-break-word">{display}</span>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="bg-stone-100 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 border-y border-stone-200">
      {label}
    </div>
  );
}

// ─── Maintext parser ──────────────────────────────────────────────────────────

const TAG_MAP: Record<string, keyof BookForm> = {
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


function parseMaintext(maintext: string): Partial<BookForm> {
  const result: Partial<BookForm> = {};
  const regex = /<(\d+)>([^<]*)/g;
  let match;

  while ((match = regex.exec(maintext)) !== null) {
    const key = TAG_MAP[match[1]];
    if (key) {
      const cleaned = match[2].replace(/\x1E$/, ""); // remove trailing RS char
      (result as Record<string, string>)[key as string] = cleaned;
    }
  }

  return result;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface BookCatalogDialogProps {
  bkID: number;
  maintext: string;
  book: { 
    branch: string; 
    entered_by: string;
    date_entered: string;
   };
}

export default function BookCatalogDialog({ bkID, maintext, book }: BookCatalogDialogProps) {
  const { user } = useSession();
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState<BookForm>({ ...defaultForm });
  const [status, setStatus]     = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSelectChange(name: keyof BookForm) {
    return (val: string) =>
      setForm(prev => ({ ...prev, [name]: val === "__empty__" ? "" : val }));
  }

  function handleCheck(key: keyof BookForm, checked: boolean) {
    setForm(prev => ({ ...prev, [key]: checked }));
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => { setStep(1); setStatus("idle"); setErrorMsg(""); }, 300);
  }

 

  async function handleSubmit() {
    if (!form.str0.trim()) { alert("Title is required."); setStep(1); return; }
    setStatus("loading");
    setErrorMsg("");
    try {
      const updatedBy = user?.name || user?.email || "library";
      const payload = buildPayload(form, book.branch, book.entered_by, book.date_entered, updatedBy);
      const ress = form.isUpdate
        ? await APIMasterPutWithJSON(`/books/${form.bkID}`, payload)
        : await APIMasterPostWithJSON(`/books/save`, payload);
      console.log(ress);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }

  const collectionItems: { key: keyof BookForm; label: string }[] = [
    { key: "gc",   label: "General Circulation" },
    { key: "tref", label: "Teacher Reference" },
    { key: "fr",   label: "Filipiniana / Reference" },
    { key: "circ", label: "Circulation" },
    { key: "ref",  label: "Reference" },
    { key: "fil",  label: "Filipiniana" },
    { key: "sp",   label: "Special Collection" },
    { key: "bio",  label: "Biography" },
    { key: "res",  label: "Reserve" },
    { key: "schl", label: "Scholastic" },
    { key: "easy", label: "Easy" },
    { key: "fic",  label: "Fiction" },
    { key: "con",  label: "Restricted" },
  ];

  const totalSteps = STEPS.length;

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const parsed = parseMaintext(maintext);
      setForm({ ...defaultForm, ...parsed, bkID: String(bkID), isUpdate: true });
      setStep(1);
      setStatus("idle");
      setErrorMsg("");
    }
  }, [open]);

  return (
   <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setOpen(true)}>
            Edit
            </Button>
        </DialogTrigger>

        <DialogContent
        className={cn(
            "max-w-7xl w-[95vw] p-0 gap-0 overflow-hidden",
            "bg-white border border-stone-200 shadow-2xl rounded-xl",
            "max-h-[95dvh] flex flex-col",   // ← restore this, was commented out
        )}
        >
        {/* ── Dialog header ── */}
        <DialogHeader className="bg-stone-900 px-6 pt-5 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge
                variant="outline"
                className="mb-2 text-[10px] tracking-widest uppercase border-stone-600 text-stone-400 bg-transparent"
              >
                Cataloguing Module
              </Badge>
              <DialogTitle className="text-white text-xl font-bold leading-tight tracking-tight">
                Book &amp; Monograph Entry
              </DialogTitle>
              <DialogDescription className="text-stone-400 text-xs mt-0.5">
                {STEPS[step - 1].label} — Step {step} of {totalSteps}
              </DialogDescription>
            </div>
            {/* progress bar */}
            <div className="flex flex-col items-end gap-1.5 min-w-30 pt-1">
              <span className="text-[10px] text-stone-500 font-mono">
                {Math.round(((step - 1) / (totalSteps - 1)) * 100)}% complete
              </span>
              <div className="w-28 h-1.5 bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Step tabs */}
          <div className="flex gap-1 mt-4 flex-wrap">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const isDone   = n < step;
              const isActive = n === step;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => isDone && setStep(n)}
                  disabled={n > step}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-all",
                    isDone
                      ? "bg-emerald-700 text-white cursor-pointer hover:bg-emerald-600"
                      : isActive
                      ? "bg-amber-500 text-stone-900 cursor-default"
                      : "bg-stone-700 text-stone-500 cursor-not-allowed",
                  )}
                >
                  <span className="opacity-70">{isDone ? "✓" : s.icon}</span>
                  <span className="hidden sm:inline">{s.short}</span>
                </button>
              );
            })}
          </div>
        </DialogHeader>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* ── Success state ── */}
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl font-bold">
                ✓
              </div>
              <h3 className="text-xl font-bold text-stone-800">Catalog Entry Saved</h3>
              <p className="text-stone-500 text-sm italic">
                "{form.str0}" has been successfully catalogued.
              </p>
              <div className="flex gap-3 mt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setForm(defaultForm);
                    setStep(1);
                    setStatus("idle");
                  }}
                  className="border-stone-300 text-stone-600 hover:bg-stone-50"
                >
                  Add Another Book
                </Button>
                <Button
                  onClick={handleClose}
                  className="bg-stone-900 text-white hover:bg-stone-700"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">

              {/* ── Step 1: Title & Authorship ─────────────────────────── */}
              {step === 1 && (
                <>
                  <StepHeader
                    title="Title & Authorship"
                    desc="Core bibliographic identification (MARC 1xx / 2xx)"
                  />
                  <FormField label="Title" name="str0" value={form.str0} onChange={handleChange} required hint="str0" />
                  <FormField label="Statement of Responsibility" name="str1" value={form.str1} onChange={handleChange} hint="str1" />
                  <FormField label="Parallel Title" name="str2" value={form.str2} onChange={handleChange} hint="str2" />
                  <FormField label="Variant Title" name="str36" value={form.str36} onChange={handleChange} hint="str36" />
                  <FormField label="Main Author / Creator" name="str3" value={form.str3} onChange={handleChange} hint="str3" />
                  <FormField label="Numeration" name="str4" value={form.str4} onChange={handleChange} hint="str4" />
                  <FormField label="Other Author" name="str5" value={form.str5} onChange={handleChange} hint="str5" />
                  <FormField label="Contributors / Editors" name="str6" value={form.str6} onChange={handleChange} hint="str6" />
                  <FormField label="Corporate Body" name="str7" value={form.str7} onChange={handleChange} hint="str7" />
                </>
              )}

              {/* ── Step 2: Publication ─────────────────────────────────── */}
              {step === 2 && (
                <>
                  <StepHeader
                    title="Publication Details"
                    desc="Imprint and edition information (MARC 260 / 264)"
                  />
                  <FormField label="Place of Publication" name="str8" value={form.str8} onChange={handleChange} hint="str8" />
                  <FormField label="Publisher" name="str9" value={form.str9} onChange={handleChange} hint="str9" />
                  <FormField label="Year of Publication" name="str10" value={form.str10} onChange={handleChange} hint="str10" />
                  <FormField label="Edition Statement" name="str11" value={form.str11} onChange={handleChange} hint="str11" />
                </>
              )}

              {/* ── Step 3: Access Points ───────────────────────────────── */}
              {step === 3 && (
                <>
                  <StepHeader
                    title="Access Points"
                    desc="Subject headings and added entries (MARC 6xx)"
                  />
                  <FormField label="Topical Subject" name="str19" value={form.str19} onChange={handleChange} hint="str19" />
                  <FormField label="Personal Name Subject" name="str20" value={form.str20} onChange={handleChange} hint="str20" />
                  <FormField label="Corporate Name Subject" name="str21" value={form.str21} onChange={handleChange} hint="str21" />
                  <FormField label="Geographic Subject" name="str22" value={form.str22} onChange={handleChange} hint="str22" />
                </>
              )}

              {/* ── Step 4: Physical Description ────────────────────────── */}
              {step === 4 && (
                <>
                  <StepHeader
                    title="Physical Description"
                    desc="Extent, illustrations, carrier (MARC 300 / 336–338)"
                  />
                  <FormField label="Extent / Pages" name="str12" value={form.str12} onChange={handleChange} hint="str12" />
                  <FormField label="Illustrative Content" name="str13" value={form.str13} onChange={handleChange} hint="str13" />
                  <FormField label="Dimensions" name="str14" value={form.str14} onChange={handleChange} hint="str14" />
                  <FormField label="Accompanying Materials" name="str15" value={form.str15} onChange={handleChange} hint="str15" />
                  <FormField label="Series Title" name="str16" value={form.str16} onChange={handleChange} hint="str16" />
                  <FormField label="General Notes" name="str17" value={form.str17} onChange={handleChange} hint="str17" />

                  <div className="grid grid-cols-3 gap-3">
                    <FormSelect
                        label="Content Type" name="str38" value={form.str38}
                        onChange={handleSelectChange("str38")}
                        options={["Text", "Still image", "Cartographic image", "Notated music", "Spoken word", "Two-dimensional moving image"]}
                    />
                    <FormSelect
                        label="Media Type" name="str39" value={form.str39}
                        onChange={handleSelectChange("str39")}
                        options={["Unmediated", "Computer", "Microform", "Projected", "Stereographic", "Video"]}
                    />
                    <FormSelect
                        label="Carrier Type" name="str40" value={form.str40}
                        onChange={handleSelectChange("str40")}
                        options={["Volume", "Online resource", "Computer disc", "Microfiche", "Microfilm roll", "Videodisc"]}
                    />
                  </div>
                 
                </>
              )}

              {/* ── Step 5: Library & Access ─────────────────────────────── */}
              {step === 5 && (
                <>
                  <StepHeader
                    title="Library & Access"
                    desc="Call number, location, holdings and collection flags"
                  />
                  <div className="flex flex-row gap-3">
                    <FormField label="ISBN" name="str18" value={form.str18} onChange={handleChange} hint="str18" />
                    <FormField label="Accession Number" name="str25" value={form.str25} onChange={handleChange} hint="str25" />
                    <FormSelect
                        label="Location" name="str27" value={form.str27}
                        onChange={handleSelectChange("str27")}
                        options={["CIRCULATION", "REFERENCE", "FILIPINIANA", "SPECIAL COLLECTION", "RESERVE"]}
                    />
                  </div>

                  <div className="flex flex-row gap-3">
                    <FormField label="Call Number Prefix" name="str23" value={form.str23} onChange={handleChange} hint="str23" />
                    <FormField label="In-house Coding" name="strCoding" value={form.strCoding} onChange={handleChange} />                    
                    <FormField label="Call Number" name="str24" value={form.str24} onChange={handleChange} hint="str24" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <FormField label="Copy Count" name="str29" value={form.str29} onChange={handleChange} hint="str29" />
                    <FormField label="Copies In" name="str30" value={form.str30} onChange={handleChange} hint="str30" />
                    <FormField label="Copies Out" name="str31" value={form.str31} onChange={handleChange} hint="str31" />
                  </div>
                  <FormField label="Times Out" name="str35" value={form.str35} onChange={handleChange} hint="str35" />
                  

                <div className="grid grid-cols-4 gap-2">
                  <FormField label="Electronic Access" name="str28" value={form.str28} onChange={handleChange} hint="str28" />
                  <FormField label="URL" name="str37" value={form.str37} onChange={handleChange} hint="str37" />
                  <FormField label="Cover Image Filename" name="str41" value={form.str41} onChange={handleChange} hint="str41" />
                  <FormSelect
                    label="Language" name="str26" value={form.str26}
                    onChange={handleSelectChange("str26")}
                    options={["English", "Filipino", "French", "Spanish", "Chinese", "Japanese", "Other"]}
                  />
                </div>
                 
                  

                  {/* Collection flags */}
                  <div className="rounded-lg border border-stone-200 p-4 bg-stone-50">
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
                      Collection / Classification Flags
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                      {collectionItems.map(({ key, label }) => (
                        <FormCheckbox
                          key={key as string}
                          id={key as string}
                          label={label}
                          checked={!!form[key]}
                          onChange={c => handleCheck(key, c)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Step 6: Notes & Acquisition ──────────────────────────── */}
              {step === 6 && (
                <>
                  <StepHeader
                    title="Notes & Acquisition"
                    desc="Descriptive notes, abstract, and acquisition metadata"
                  />
                  <FormTextArea label="Content Notes" name="str32" value={form.str32} onChange={handleChange} hint="str32" />
                  <FormTextArea label="Summary" name="str33" value={form.str33} onChange={handleChange} hint="str33" />
                  <FormTextArea label="Abstract" name="str34" value={form.str34} onChange={handleChange} hint="str34" />
                  <FormSelect
                    label="Acquisition Mode" name="strAcquisitionMode" value={form.strAcquisitionMode}
                    onChange={handleSelectChange("strAcquisitionMode")}
                    options={["", "Purchase", "Donation", "Exchange", "Transfer"]}
                  />
                  <FormField label="Donor" name="strDonor" value={form.strDonor} onChange={handleChange} />
                </>
              )}

              {/* ── Step 7: Review & Submit ───────────────────────────────── */}
              {step === 7 && (
                <>
                  <StepHeader
                    title="Review & Submit"
                    desc="Confirm all details before saving to the catalog"
                  />
                  <div className="rounded-lg border border-stone-200 overflow-hidden bg-white text-sm">
                    <SectionDivider label="Title & Authorship" />
                    <PreviewRow label="Title"          value={form.str0} />
                    <PreviewRow label="Resp. Statement" value={form.str1} />
                    <PreviewRow label="Parallel Title"  value={form.str2} />
                    <PreviewRow label="Variant Title"   value={form.str36} />
                    <PreviewRow label="Main Author"     value={form.str3} />
                    <PreviewRow label="Numeration"      value={form.str4} />
                    <PreviewRow label="Other Author"    value={form.str5} />
                    <PreviewRow label="Contributors"    value={form.str6} />
                    <PreviewRow label="Corporate Body"  value={form.str7} />

                    <SectionDivider label="Publication" />
                    <PreviewRow label="Place"     value={form.str8} />
                    <PreviewRow label="Publisher" value={form.str9} />
                    <PreviewRow label="Year"      value={form.str10} />
                    <PreviewRow label="Edition"   value={form.str11} />

                    <SectionDivider label="Access Points" />
                    <PreviewRow label="Topical"     value={form.str19} />
                    <PreviewRow label="Personal"    value={form.str20} />
                    <PreviewRow label="Corporate"   value={form.str21} />
                    <PreviewRow label="Geographical" value={form.str22} />

                    <SectionDivider label="Physical Description" />
                    <PreviewRow label="Extent"        value={form.str12} />
                    <PreviewRow label="Illustrations" value={form.str13} />
                    <PreviewRow label="Dimensions"    value={form.str14} />
                    <PreviewRow label="Series"        value={form.str16} />
                    <PreviewRow label="Content Type"  value={form.str38} />
                    <PreviewRow label="Media Type"    value={form.str39} />
                    <PreviewRow label="Carrier Type"  value={form.str40} />

                    <SectionDivider label="Library & Access" />
                    <PreviewRow label="ISBN"       value={form.str18} />
                    <PreviewRow label="Call Number" value={`${form.str23} ${form.strCoding} ${form.str24}`.trim()} />
                    <PreviewRow label="Accession"  value={form.str25} />
                    <PreviewRow label="Copies"     value={`${form.str29} total, ${form.str30} in, ${form.str31} out`} />
                    <PreviewRow label="Language"   value={form.str26} />
                    <PreviewRow label="Branch"     value={form.str27} />
                    <PreviewRow label="URL"        value={form.str37} />
                    <PreviewRow label="General Circ." value={form.gc} />
                    <PreviewRow label="Reference"  value={form.ref} />
                    <PreviewRow label="Filipiniana" value={form.fil} />
                    <PreviewRow label="Restricted" value={form.con} />

                    <SectionDivider label="Notes & Acquisition" />
                    <PreviewRow label="Summary"     value={form.str33} />
                    <PreviewRow label="Abstract"    value={form.str34} />
                    <PreviewRow label="Acquisition" value={form.strAcquisitionMode} />
                    <PreviewRow label="Donor"       value={form.strDonor} />
                  </div>

                  {status === "error" && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 font-medium">
                      ⚠ Save failed: {errorMsg || "Please try again."}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Footer / Navigation ── */}
        {status !== "success" && (
          <DialogFooter className=" border-t border-stone-100 px-10 py-5 bg-stone-50 flex items-center justify-between gap-3 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={step === 1}
              onClick={() => setStep(s => s - 1)}
              className="border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
            >
              ← Back
            </Button>

            <span className="text-xs text-stone-400 font-mono tabular-nums">
              {step} / {totalSteps}
            </span>

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={(e) => { e.preventDefault(); setStep(s => s + 1); }}
                className="bg-stone-900 text-white hover:bg-stone-700"
              >
                Next →
              </Button>
            ) : (
              <Button
                type="button"
                disabled={status === "loading"}
                onClick={handleSubmit}
                className="bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-60 px-6"
              >
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : (
                  "Save to Catalog ✓"
                )}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Step heading sub-component ───────────────────────────────────────────────

function StepHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="pb-2 border-b border-stone-100">
      <h3 className="text-base font-bold text-stone-800 tracking-tight">{title}</h3>
      <p className="text-xs text-stone-400 italic mt-0.5">{desc}</p>
    </div>
  );
}

