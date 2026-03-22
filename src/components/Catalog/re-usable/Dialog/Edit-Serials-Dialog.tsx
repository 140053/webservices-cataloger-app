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

type SerialsForm = {
  str0: string;   // Article title
  str1: string;   // Creator(s) / Author(s)
  str2: string;   // Periodical title
  str3: string;   // Volume
  str4: string;   // Issue / Number
  str5: string;   // Date
  str6: string;   // Pages
  str7: string;   // Type of article
  str8: string;   // Language
  str9: string;   // Location
  str10: string;  // Electronic access / e-file
  str11: string;  // Subject / Keywords
  str12: string;  // Abstract
  con: boolean;
  bkID: string;
  isUpdate: boolean;
};

const defaultForm: SerialsForm = {
  str0: "", str1: "", str2: "", str3: "", str4: "", str5: "",
  str6: "", str7: "", str8: "English", str9: "", str10: "",
  str11: "", str12: "", con: false, bkID: "", isUpdate: false,
};

const STEPS = [
  { label: "Article & Authors",   icon: "01", short: "Article" },
  { label: "Periodical Details",  icon: "02", short: "Periodical" },
  { label: "Classification",      icon: "03", short: "Class" },
  { label: "Access & Location",   icon: "04", short: "Access" },
  { label: "Abstract & Keywords", icon: "05", short: "Abstract" },
  { label: "Review & Submit",     icon: "06", short: "Review" },
];

const ARTICLE_TYPES = [
  "", "Article", "Book review", "Case study", "Commentary",
  "Correspondence", "Discussion article", "Editorial", "Essay",
  "Featured article", "Interview", "Lesson plan", "Newspaper article",
  "Opinion", "Poem", "Research article", "Research communication",
  "Review article", "Short story",
];

// ─── Maintext parser ──────────────────────────────────────────────────────────

const TAG_MAP: Record<string, keyof SerialsForm> = {
  "001": "str0",  "002": "str1",  "003": "str2",  "004": "str3",
  "005": "str4",  "006": "str5",  "007": "str6",  "008": "str7",
  "009": "str8",  "0010": "str9", "0011": "str10","0012": "str11",
  "0013": "str12",
};

function parseMaintext(maintext: string): Partial<SerialsForm> {
  const result: Partial<SerialsForm> = {};
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

function buildMaintext(form: SerialsForm): string {
  const pairs: [string, string][] = [
    ["001", form.str0], ["002", form.str1], ["003", form.str2],
    ["004", form.str3], ["005", form.str4], ["006", form.str5],
    ["007", form.str6], ["008", form.str7], ["009", form.str8],
    ["0010", form.str9], ["0011", form.str10], ["0012", form.str11],
    ["0013", form.str12],
  ];
  return pairs.map(([tag, val]) => `<${tag}>${val.trim()}`).join("").replace(/\\/g, "/");
}

function buildPayload(form: SerialsForm) {
  const now = new Date().toISOString();
  const maintext = buildMaintext(form).replace(/"/g, "").replace(/'/g, "`");
  return {
    Title: form.str0,
    Maintext: maintext,
    tm: "pr",
    images: null,
    t_Out: 0, t_TimesOut: 0, Copy: 0, Inn: 0,
    gc: 0, tr: 0, easy: 0, circ: 0, fr: 0, sm: 0, schl: 0,
    coding: null,
    restricted: form.con ? 1 : 0,
    filsts: null,
    branch: "Library",
    entered_by: "library",
    date_entered: now,
    updated_by: "library",
    bkID: form.bkID,
    date_updated: now,
  };
}

// ─── Reusable field components ────────────────────────────────────────────────

function FormField({ label, name, value, onChange, required, placeholder }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; placeholder?: string;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-y-1 items-start">
      <Label htmlFor={name} className="text-sm font-semibold text-stone-600 pt-2.5 leading-tight">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Input
        id={name} name={name} value={value} onChange={onChange}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        className="h-9 bg-stone-50 border-stone-200 focus:border-stone-400 text-sm font-medium text-stone-800 placeholder:text-stone-300 rounded-md"
      />
    </div>
  );
}

function FormTextArea({ label, name, value, onChange, rows = 4 }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-x-4 gap-y-1 items-start">
      <Label htmlFor={name} className="text-sm font-semibold text-stone-600 pt-2.5 leading-tight">{label}</Label>
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

interface EditSerialsDialogProps {
  bkID: number;
  maintext: string;
}

export default function EditSerialsDialog({ bkID, maintext }: EditSerialsDialogProps) {
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState<SerialsForm>({ ...defaultForm });
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

  function handleSelectChange(name: keyof SerialsForm) {
    return (val: string) =>
      setForm(prev => ({ ...prev, [name]: val === "__empty__" ? "" : val }));
  }

  function handleCheck(key: keyof SerialsForm, checked: boolean) {
    setForm(prev => ({ ...prev, [key]: checked }));
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => { setStep(1); setStatus("idle"); setErrorMsg(""); }, 300);
  }

  async function handleSubmit() {
    if (!form.str0.trim()) { alert("Article title is required."); setStep(1); return; }
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
                Indexing Module
              </Badge>
              <DialogTitle className="text-white text-xl font-bold leading-tight tracking-tight">
                Periodical Article Entry
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

              {/* Step 1: Article & Authors */}
              {step === 1 && (
                <section className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800 border-b border-stone-200 pb-2">Article &amp; Authors</h3>
                  <FormField label="Article Title" name="str0" value={form.str0} onChange={handleChange} required />
                  <FormField label="Creator(s) / Author(s)" name="str1" value={form.str1} onChange={handleChange} />
                </section>
              )}

              {/* Step 2: Periodical Details */}
              {step === 2 && (
                <section className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800 border-b border-stone-200 pb-2">Periodical Details</h3>
                  <FormField label="Periodical Title" name="str2" value={form.str2} onChange={handleChange} />
                  <FormField label="Volume" name="str3" value={form.str3} onChange={handleChange} />
                  <FormField label="Issue / Number" name="str4" value={form.str4} onChange={handleChange} />
                  <FormField label="Date" name="str5" value={form.str5} onChange={handleChange} />
                  <FormField label="Pages" name="str6" value={form.str6} onChange={handleChange} />
                </section>
              )}

              {/* Step 3: Classification */}
              {step === 3 && (
                <section className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800 border-b border-stone-200 pb-2">Classification</h3>
                  <FormSelect label="Type of Article" name="str7" value={form.str7} onChange={handleSelectChange("str7")} options={ARTICLE_TYPES} />
                  <FormSelect
                    label="Language" name="str8" value={form.str8}
                    onChange={handleSelectChange("str8")}
                    options={["English", "Filipino", "French", "Spanish", "Chinese", "Japanese", "Other"]}
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="serials-con"
                      checked={form.con}
                      onCheckedChange={(c) => handleCheck("con", !!c)}
                      className="border-stone-300 data-[state=checked]:bg-stone-700 data-[state=checked]:border-stone-700"
                    />
                    <label htmlFor="serials-con" className="text-sm text-stone-600 cursor-pointer">Restricted</label>
                  </div>
                </section>
              )}

              {/* Step 4: Access & Location */}
              {step === 4 && (
                <section className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800 border-b border-stone-200 pb-2">Access &amp; Location</h3>
                  <FormField label="Location" name="str9" value={form.str9} onChange={handleChange} />
                  <FormField label="Electronic Access" name="str10" value={form.str10} onChange={handleChange} />
                </section>
              )}

              {/* Step 5: Abstract & Keywords */}
              {step === 5 && (
                <section className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800 border-b border-stone-200 pb-2">Abstract &amp; Keywords</h3>
                  <FormField label="Subject / Keywords" name="str11" value={form.str11} onChange={handleChange} />
                  <FormTextArea label="Abstract" name="str12" value={form.str12} onChange={handleChange} rows={8} />
                </section>
              )}

              {/* Step 6: Review & Submit */}
              {step === 6 && (
                <section className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800 border-b border-stone-200 pb-2">Review &amp; Submit</h3>
                  <div className="rounded-lg border border-stone-200 overflow-hidden text-sm">
                    <SectionDivider label="Article & Authors" />
                    <PreviewRow label="Article Title" value={form.str0} />
                    <PreviewRow label="Creator(s)" value={form.str1} />
                    <SectionDivider label="Periodical Details" />
                    <PreviewRow label="Periodical" value={form.str2} />
                    <PreviewRow label="Volume" value={form.str3} />
                    <PreviewRow label="Issue / Number" value={form.str4} />
                    <PreviewRow label="Date" value={form.str5} />
                    <PreviewRow label="Pages" value={form.str6} />
                    <SectionDivider label="Classification" />
                    <PreviewRow label="Type" value={form.str7} />
                    <PreviewRow label="Language" value={form.str8} />
                    <PreviewRow label="Restricted" value={form.con} />
                    <SectionDivider label="Access & Location" />
                    <PreviewRow label="Location" value={form.str9} />
                    <PreviewRow label="Electronic Access" value={form.str10} />
                    <SectionDivider label="Abstract & Keywords" />
                    <PreviewRow label="Keywords" value={form.str11} />
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
