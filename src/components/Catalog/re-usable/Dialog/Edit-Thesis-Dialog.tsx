"use client";

import { APIMasterPutWithJSON } from "@/utils/book";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

// ─── Types ────────────────────────────────────────────────────────────────────

type ThesisForm = {
  str0: string;   // Title
  str1: string;   // Creator(s) / Author(s)
  str2: string;   // Institution
  str3: string;   // Course / Program
  str4: string;   // Date / Year
  str5: string;   // Extent of material
  str6: string;   // Call number
  str7: string;   // Accession number
  str8: string;   // Language
  str9: string;   // Location
  str10: string;  // Electronic access / e-file
  str11: string;  // Subjects / Keywords
  str12: string;  // Abstract
  str13: string;  // Copy count
  str14: string;  // On-shelf (Inn)
  str15: string;  // Out
  str16: string;  // Type (Thesis, Dissertation, etc.)
  str17: string;  // Illustrative details
  str18: string;  // Dimension
  str19: string;  // Supplementary content
  strCoding: string;
  con: boolean;
  bkID: string;
  isUpdate: boolean;
};

const defaultForm: ThesisForm = {
  str0: "", str1: "", str2: "", str3: "", str4: "", str5: "",
  str6: "", str7: "", str8: "English", str9: "", str10: "",
  str11: "", str12: "", str13: "1", str14: "1", str15: "0",
  str16: "", str17: "", str18: "", str19: "", strCoding: "",
  con: false, bkID: "", isUpdate: false,
};

const STEPS = [
  { label: "Title & Creators",   icon: "01", short: "Title" },
  { label: "Institution & Type", icon: "02", short: "Institution" },
  { label: "Physical Details",   icon: "03", short: "Physical" },
  { label: "Library & Access",   icon: "04", short: "Library" },
  { label: "Abstract & Notes",   icon: "05", short: "Abstract" },
  { label: "Review & Submit",    icon: "06", short: "Review" },
];

const THESIS_TYPES = [
  "", "Thesis", "Business plan", "Case study", "Dissertation",
  "Feasibility study", "Special problem", "Strategic plan",
  "Research project", "Master Thesis", "Narrative Report",
];

// ─── Maintext parser ──────────────────────────────────────────────────────────

const TAG_MAP: Record<string, keyof ThesisForm> = {
  "001": "str0",  "002": "str1",  "003": "str2",  "004": "str3",
  "005": "str4",  "006": "str5",  "007": "str6",  "008": "str7",
  "009": "str8",  "0010": "str9", "0011": "str10","0012": "str11",
  "0013": "str12","0014": "str13","0015": "str14","0016": "str15",
  "0017": "str16","0018": "str17","0019": "str18","0020": "str19",
};

function parseMaintext(maintext: string): Partial<ThesisForm> {
  const result: Partial<ThesisForm> = {};
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMaintext(form: ThesisForm): string {
  const pairs: [string, string][] = [
    ["001", form.str0], ["002", form.str1], ["003", form.str2],
    ["004", form.str3], ["005", form.str4], ["006", form.str5],
    ["007", form.str6], ["008", form.str7], ["009", form.str8],
    ["0010", form.str9], ["0011", form.str10], ["0012", form.str11],
    ["0013", form.str12], ["0014", form.str13], ["0015", form.str14],
    ["0016", form.str15], ["0017", form.str16], ["0018", form.str17],
    ["0019", form.str18], ["0020", form.str19],
  ];
  return pairs.map(([tag, val]) => `<${tag}>${val.trim()}`).join("").replace(/\\/g, "/");
}

function buildPayload(form: ThesisForm) {
  const now = new Date().toISOString();
  const maintext = buildMaintext(form).replace(/"/g, "").replace(/'/g, "`");
  return {
    Title: form.str0,
    Maintext: maintext,
    Copy: parseInt(form.str13) || 0,
    Inn: parseInt(form.str14) || 0,
    t_Out: 0, t_TimesOut: 0,
    tm: "td",
    restricted: form.con ? 1 : 0,
    filsts: null,
    coding: form.strCoding || null,
    branch: "Library",
    entered_by: "library",
    date_entered: now,
    updated_by: "library",
    bkID: form.bkID,
    date_updated: now,
  };
}

// ─── Reusable field components ────────────────────────────────────────────────

function FormField({ label, name, value, onChange, required, hint, placeholder }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; hint?: string; placeholder?: string;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-y-1 items-start">
      <Label htmlFor={name} className="text-sm font-semibold text-stone-600 pt-2.5 leading-tight">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="block text-[10px] font-normal text-stone-400 italic">{hint}</span>}
      </Label>
      <Input
        id={name} name={name} value={value} onChange={onChange}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        className="h-9 bg-stone-50 border-stone-200 focus:border-stone-400 text-sm font-medium text-stone-800 placeholder:text-stone-300 rounded-md"
      />
    </div>
  );
}

function FormTextArea({ label, name, value, onChange, hint, rows = 4 }: {
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
        className="bg-stone-50 border-stone-200 text-sm font-medium text-stone-800 placeholder:text-stone-300 resize-y rounded-md"
      />
    </div>
  );
}

function FormSelect({ label, name, value, onChange, options }: {
  label: string; name: string; value: string;
  onChange: (val: string) => void;
  options: string[];
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-y-1 items-start">
      <Label className="text-sm font-semibold text-stone-600 pt-2.5 leading-tight">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 bg-stone-50 border-stone-200 text-sm font-medium text-stone-800 rounded-md w-full">
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

function PreviewRow({ label, value }: { label: string; value: string | boolean | number }) {
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  if (!display || display === "false" || display === "No" || display === "0") return null;
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 px-4 py-2 border-b border-stone-100 last:border-0 text-sm">
      <span className="text-stone-400 font-semibold">{label}</span>
      <span className="text-stone-700 break-words">{display}</span>
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

// ─── Main component ───────────────────────────────────────────────────────────

interface EditThesisDialogProps {
  bkID: number;
  maintext: string;
}

export default function EditThesisDialog({ bkID, maintext }: EditThesisDialogProps) {
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState<ThesisForm>({ ...defaultForm });
  const [status, setStatus]     = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    if (open) {
      const parsed = parseMaintext(maintext);
      setForm({ ...defaultForm, ...parsed, bkID: String(bkID), isUpdate: true });
      setStep(1);
      setStatus("idle");
      setErrorMsg("");
    }
  }, [open]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSelectChange(name: keyof ThesisForm) {
    return (val: string) =>
      setForm(prev => ({ ...prev, [name]: val === "__empty__" ? "" : val }));
  }

  function handleCheck(key: keyof ThesisForm, checked: boolean) {
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
      const payload = buildPayload(form);
      const ress = await APIMasterPutWithJSON(`/books/${form.bkID}`, payload);
      console.log(ress);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }

  const totalSteps = STEPS.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>Edit</Button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "max-w-4xl w-[95vw] p-0 gap-0 overflow-hidden",
          "bg-white border border-stone-200 shadow-2xl rounded-xl",
          "max-h-[95dvh] flex flex-col",
        )}
      >
        {/* ── Header ── */}
        <DialogHeader className="bg-stone-900 px-6 pt-5 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant="outline" className="mb-2 text-[10px] tracking-widest uppercase border-stone-600 text-stone-400 bg-transparent">
                Cataloguing Module
              </Badge>
              <DialogTitle className="text-white text-xl font-bold leading-tight tracking-tight">
                Thesis &amp; Academic Work Entry
              </DialogTitle>
              <DialogDescription className="text-stone-400 text-xs mt-0.5">
                {STEPS[step - 1].label} — Step {step} of {totalSteps}
              </DialogDescription>
            </div>
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
                    isDone   ? "bg-emerald-700 text-white cursor-pointer hover:bg-emerald-600"
                    : isActive ? "bg-amber-500 text-stone-900 cursor-default"
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

          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl font-bold">✓</div>
              <h3 className="text-xl font-bold text-stone-800">Entry Updated</h3>
              <p className="text-stone-500 text-sm italic">"{form.str0}" has been successfully updated.</p>
              <Button variant="outline" onClick={handleClose} className="border-stone-300 text-stone-600 hover:bg-stone-50">
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4">

              {/* Step 1: Title & Creators */}
              {step === 1 && (
                <section className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800 border-b border-stone-200 pb-2">Title &amp; Creators</h3>
                  <FormField label="Title" name="str0" value={form.str0} onChange={handleChange} required />
                  <FormField label="Creator(s) / Author(s)" name="str1" value={form.str1} onChange={handleChange} />
                </section>
              )}

              {/* Step 2: Institution & Type */}
              {step === 2 && (
                <section className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800 border-b border-stone-200 pb-2">Institution &amp; Type</h3>
                  <FormField label="Institution" name="str2" value={form.str2} onChange={handleChange} />
                  <FormField label="Course / Program" name="str3" value={form.str3} onChange={handleChange} />
                  <FormField label="Date / Year" name="str4" value={form.str4} onChange={handleChange} />
                  <FormSelect label="Type of Work" name="str16" value={form.str16} onChange={handleSelectChange("str16")} options={THESIS_TYPES} />
                  <FormField label="Subjects / Keywords" name="str11" value={form.str11} onChange={handleChange} />
                </section>
              )}

              {/* Step 3: Physical Details */}
              {step === 3 && (
                <section className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800 border-b border-stone-200 pb-2">Physical Details</h3>
                  <FormField label="Extent of Material" name="str5" value={form.str5} onChange={handleChange} />
                  <FormField label="Illustrative Details" name="str17" value={form.str17} onChange={handleChange} />
                  <FormField label="Dimension" name="str18" value={form.str18} onChange={handleChange} />
                  <FormField label="Supplementary Content" name="str19" value={form.str19} onChange={handleChange} />
                </section>
              )}

              {/* Step 4: Library & Access */}
              {step === 4 && (
                <section className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800 border-b border-stone-200 pb-2">Library &amp; Access</h3>
                  <FormField label="Call Number" name="str6" value={form.str6} onChange={handleChange} />
                  <FormField label="In-house Coding" name="strCoding" value={form.strCoding} onChange={handleChange} />
                  <FormField label="Accession Number" name="str7" value={form.str7} onChange={handleChange} />
                  <FormSelect
                    label="Language" name="str8" value={form.str8}
                    onChange={handleSelectChange("str8")}
                    options={["English", "Filipino", "French", "Spanish", "Chinese", "Japanese", "Other"]}
                  />
                  <FormField label="Location" name="str9" value={form.str9} onChange={handleChange} />
                  <FormField label="Electronic Access" name="str10" value={form.str10} onChange={handleChange} />
                  <FormField label="Copy Count" name="str13" value={form.str13} onChange={handleChange} />
                  <FormField label="On-shelf" name="str14" value={form.str14} onChange={handleChange} />
                  <FormField label="Out" name="str15" value={form.str15} onChange={handleChange} />
                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="thesis-con"
                      checked={form.con}
                      onCheckedChange={(c) => handleCheck("con", !!c)}
                      className="border-stone-300 data-[state=checked]:bg-stone-700 data-[state=checked]:border-stone-700"
                    />
                    <label htmlFor="thesis-con" className="text-sm text-stone-600 cursor-pointer">Restricted</label>
                  </div>
                </section>
              )}

              {/* Step 5: Abstract & Notes */}
              {step === 5 && (
                <section className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800 border-b border-stone-200 pb-2">Abstract &amp; Notes</h3>
                  <FormTextArea label="Abstract" name="str12" value={form.str12} onChange={handleChange} rows={10} />
                </section>
              )}

              {/* Step 6: Review & Submit */}
              {step === 6 && (
                <section className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800 border-b border-stone-200 pb-2">Review &amp; Submit</h3>
                  <div className="rounded-lg border border-stone-200 overflow-hidden text-sm">
                    <SectionDivider label="Title & Creators" />
                    <PreviewRow label="Title" value={form.str0} />
                    <PreviewRow label="Creator(s)" value={form.str1} />
                    <SectionDivider label="Institution & Type" />
                    <PreviewRow label="Institution" value={form.str2} />
                    <PreviewRow label="Course / Program" value={form.str3} />
                    <PreviewRow label="Date / Year" value={form.str4} />
                    <PreviewRow label="Type of Work" value={form.str16} />
                    <PreviewRow label="Keywords" value={form.str11} />
                    <SectionDivider label="Physical Details" />
                    <PreviewRow label="Extent" value={form.str5} />
                    <PreviewRow label="Illustrations" value={form.str17} />
                    <PreviewRow label="Dimension" value={form.str18} />
                    <PreviewRow label="Supplementary" value={form.str19} />
                    <SectionDivider label="Library & Access" />
                    <PreviewRow label="Call Number" value={`${form.str6} ${form.strCoding}`.trim()} />
                    <PreviewRow label="Accession" value={form.str7} />
                    <PreviewRow label="Language" value={form.str8} />
                    <PreviewRow label="Location" value={form.str9} />
                    <PreviewRow label="Electronic Access" value={form.str10} />
                    <PreviewRow label="Copy Count" value={form.str13} />
                    <PreviewRow label="On-shelf" value={form.str14} />
                    <PreviewRow label="Restricted" value={form.con} />
                    <SectionDivider label="Abstract" />
                    <PreviewRow label="Abstract" value={form.str12} />
                  </div>
                  {status === "error" && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      Save failed: {errorMsg || "Please try again."}
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {status !== "success" && (
          <div className="shrink-0 px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50">
            <Button
              variant="outline"
              disabled={step === 1}
              onClick={() => setStep(s => s - 1)}
              className="border-stone-300 text-stone-600"
            >
              ← Back
            </Button>
            <span className="text-xs text-stone-400 font-mono">{step} / {totalSteps}</span>
            {step < totalSteps ? (
              <Button onClick={() => setStep(s => s + 1)} className="bg-stone-900 text-white hover:bg-stone-700">
                Next →
              </Button>
            ) : (
              <Button
                disabled={status === "loading"}
                onClick={handleSubmit}
                className="bg-emerald-700 text-white hover:bg-emerald-600"
              >
                {status === "loading" ? "Saving…" : "Save Changes ✓"}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
