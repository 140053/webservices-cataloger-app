"use client";

import { APIMasterPostWithJSON } from "@/utils/book";
import { useState } from "react";

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
  str38: string; // Content type
  str39: string; // Media type 
  str40: string; // Carrier type
  str41: string; // Cover image filename
  str42: string; // 
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
  str0: "",
  str1: "",
  str2: "",
  str3: "", 
  str4: "", 
  str5: "", 
  str6: "",
  str7: "", 
  str8: "", 
  str9: "", 
  str10: "", 
  str11: "", 
  str12: "", 
  str13: "",
  str14: "", 
  str15: "", 
  str16: "", 
  str17: "", 
  str18: "", 
  str19: "", 
  str20: "",
  str21: "", 
  str22: "", 
  str23: "", 
  str24: "", 
  str25: "", 
  str26: "English",
  str27: "CIRCULATION", 
  str28: "", 
  str29: "1", 
  str30: "1", 
  str31: "0",
  str32: "",
  str33: "", 
  str34: "", 
  str35: "0", 
  str36: "", 
  str37: "", 
  str38: "Text",
  str39: "Unmediated", 
  str40: "Volume", 
  str41: "", 
  str42: "",
  gc: false, 
  tref: false, 
  fr: false, 
  circ: true, 
  ref: false, 
  fil: false,
  sp: false, 
  bio: false, 
  res: false, 
  schl: false, 
  easy: false, 
  fic: false,
  con: false,
  strAcquisitionMode: "", 
  strDonor: "", 
  strCoding: "", 
  bkID: "", 
  isUpdate: false,
};

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Title & Authorship",    icon: "01" },
  { label: "Publication",           icon: "02" },
  { label: "Access Points",         icon: "03" },
  { label: "Physical Description",  icon: "04" },
  { label: "Library & Access",      icon: "05" },
  { label: "Notes & Acquisition",   icon: "06" },
  { label: "Review & Submit",       icon: "07" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMaintext(form: BookForm): string {
  const pairs: [string, string][] = [
    ["001", form.str0],  
    ["002", form.str1],  
    ["003", form.str2],
    ["004", form.str3],  
    ["005", form.str4],  
    ["006", form.str5],
    ["007", form.str6],  
    ["008", form.str7],  
    ["009", form.str8],
    ["0010", form.str9], 
    ["0011", form.str10],
    ["0012", form.str11],
    ["0013", form.str12],
    ["0014", form.str13],
    ["0015", form.str14],
    ["0016", form.str15],
    ["0017", form.str16],
    ["0018", form.str17],
    ["0019", form.str18],
    ["0020", form.str19],
    ["0021", form.str20],
    ["0022", form.str21],
    ["0023", form.str22],
    ["0024", form.str23],
    ["0025", form.str24],
    ["0026", form.str25],
    ["0027", form.str26],
    ["0028", form.str27],
    ["0029", form.str28],
    ["0030", form.str29],
    ["0031", form.str30],
    ["0032", form.str31],
    ["0033", form.str32],
    ["0034", form.str33],
    ["0035", form.str34],
    ["0036", form.str35],
    ["0037", form.str36],
    ["0038", form.str37],
    ["0039", form.str38],
    ["0040", form.str39],
    ["0041", form.str40],
    ["0042", form.str41],
  ];
  return pairs.map(([tag, val]) => `<${tag}>${val.trim()}`).join("").replace(/\\/g, "/");
}


function buildPayload(form: BookForm) {
    const title = form.str0;
    const maintext = buildMaintext(form)
      .replace(/"/g, "")
      .replace(/'/g, "`");
  
    const now = new Date().toISOString();
  
    return {
      Title: title,
      Maintext: maintext,
  
      // ✅ match exact casing from API
      Fil: form.fil ? 1 : 0,
      Ref: form.ref ? 1 : 0,
      Bio: form.bio ? 1 : 0,
      Fic: form.fic ? 1 : 0,
      Res: form.res ? 1 : 0,
  
      Copy: parseInt(form.str29) || 0,
      Inn: parseInt(form.str30) || 0,
  
      t_Out: 0,
      t_TimesOut: 0,
  
      images: form.str41 || null,
      tm: "book",
  
      gc: form.gc ? 1 : 0,
      tr: form.tref ? 1 : 0,
      easy: form.easy ? 1 : 0,
      circ: form.circ ? 1 : 0,
      fr: form.fr ? 1 : 0,
      sm: form.sp ? 1 : 0,
  
      entered_by: "library",
      date_entered: now,
      updated_by: "library",
  
      schl: form.schl ? 1 : 0,
  
      acquisitionmode: form.strAcquisitionMode || null,
      donor: form.strDonor || null,
      branch: "Library",
  
      restricted: form.con ? 1 : 0,
      filsts: null,
  
      coding: form.strCoding || null,
  
      // ✅ optional: include only if updating
      ...(form.isUpdate ? { bkID: form.bkID, date_updated: now } : {}),
    };
  }

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, name, value, onChange, required, hint }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; hint?: string;
}) {
  return (
    <div className="field-row">
      <label htmlFor={name} className="field-label">
        {label}{required && <span className="required-mark">*</span>}
        {hint && <span className="field-hint"> — {hint}</span>}
      </label>
      <input
        id={name} name={name} value={value} onChange={onChange}
        className="field-input"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}

function TextArea({ label, name, value, onChange, hint }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  hint?: string;
}) {
  return (
    <div className="field-row">
      <label htmlFor={name} className="field-label">
        {label}
        {hint && <span className="field-hint"> — {hint}</span>}
      </label>
      <textarea
        id={name} name={name} value={value} onChange={onChange}
        className="field-textarea"
        placeholder={`Enter ${label.toLowerCase()}`}
        rows={4}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, hint }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[]; hint?: string;
}) {
  return (
    <div className="field-row">
      <label htmlFor={name} className="field-label">
        {label}
        {hint && <span className="field-hint"> — {hint}</span>}
      </label>
      <select id={name} name={name} value={value} onChange={onChange} className="field-input">
        {options.map(o => <option key={o} value={o}>{o || "— select —"}</option>)}
      </select>
    </div>
  );
}

function CheckboxGroup({ legend, items, values, onChange }: {
  legend: string;
  items: { key: keyof BookForm; label: string }[];
  values: BookForm;
  onChange: (key: keyof BookForm, checked: boolean) => void;
}) {
  return (
    <div className="checkbox-group">
      <p className="checkbox-legend">{legend}</p>
      <div className="checkbox-grid">
        {items.map(({ key, label }) => (
          <label key={key as string} className="checkbox-item">
            <input
              type="checkbox"
              checked={!!values[key]}
              onChange={e => onChange(key, e.target.checked)}
              className="checkbox-input"
            />
            <span className="checkbox-label">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string | boolean | number }) {
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  if (!display || display === "false") return null;
  return (
    <div className="preview-row">
      <span className="preview-label">{label}</span>
      <span className="preview-value">{display || "—"}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BookCatalogForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BookForm>(defaultForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleCheck(key: keyof BookForm, checked: boolean) {
    setForm(prev => ({ ...prev, [key]: checked }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.str0.trim()) { alert("Title is required."); setStep(1); return; }

    setStatus("loading");
    setErrorMsg("");

    try {
      const payload = buildPayload(form);
      //const endpoint = form.isUpdate ? `/books/update` : `/books/save`;

      const ress = await  APIMasterPostWithJSON(`/books/save`, payload)

      //const res = await fetch(endpoint, {
      //  method: "POST",
      //  headers: { "Content-Type": "application/json" },
      //  body: JSON.stringify(payload),
      //});
      console.log(ress)

      //if (!res.ok) throw new Error(`Server responded with ${res.status}`);

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

  if (status === "success") {
    return (
      <>
        <style>{CSS}</style>
        <div className="success-screen">
          <div className="success-icon">✓</div>
          <h2 className="success-title">Catalog Entry Saved</h2>
          <p className="success-sub">"{form.str0}" has been successfully catalogued.</p>
          <button className="btn-primary" onClick={() => { setForm(defaultForm); setStep(1); setStatus("idle"); }}>
            Add Another Book
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="catalog-shell">
        {/* Header */}
        <header className="catalog-header">
          <div className="catalog-header-inner">
            <span className="catalog-badge">CATALOGUING MODULE</span>
            <h1 className="catalog-title">Book & Monograph Entry</h1>
          </div>
        </header>

        {/* Step rail */}
        <nav className="step-rail">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const state = n < step ? "done" : n === step ? "active" : "idle";
            return (
              <button
                key={n}
                className={`step-pill step-pill--${state}`}
                onClick={() => n < step && setStep(n)}
                disabled={n > step}
                type="button"
              >
                <span className="step-num">{n < step ? "✓" : s.icon}</span>
                <span className="step-text">{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Form body */}
        <form onSubmit={handleSubmit}  onKeyDown={(e) => {
              if (e.key === "Enter" && step !== 7) {
                e.preventDefault();
              }
            }} className="catalog-body">
          <div className="step-card">

            {/* ── Step 1: Title & Authorship ─────────────────────────────── */}
            {step === 1 && (
              <section className="step-section">
                <h2 className="step-heading">Title &amp; Authorship</h2>
                <p className="step-desc">Core bibliographic identification (MARC 1xx / 2xx)</p>
                <Field label="Title" name="str0" value={form.str0} onChange={handleChange} required hint="str0" />
                <Field label="Statement of Responsibility" name="str1" value={form.str1} onChange={handleChange} hint="str1" />
                <Field label="Parallel Title" name="str2" value={form.str2} onChange={handleChange} hint="str2" />
                <Field label="Variant Title" name="str36" value={form.str36} onChange={handleChange} hint="str36" />
                <Field label="Main Author / Creator" name="str3" value={form.str3} onChange={handleChange} hint="str3" />
                <Field label="Numeration" name="str4" value={form.str4} onChange={handleChange} hint="str4" />
                <Field label="Other Author" name="str5" value={form.str5} onChange={handleChange} hint="str5" />
                <Field label="Contributors / Editors" name="str6" value={form.str6} onChange={handleChange} hint="str6" />
                <Field label="Corporate Body" name="str7" value={form.str7} onChange={handleChange} hint="str7" />
              </section>
            )}

            {/* ── Step 2: Publication ────────────────────────────────────── */}
            {step === 2 && (
              <section className="step-section">
                <h2 className="step-heading">Publication Details</h2>
                <p className="step-desc">Imprint and edition information (MARC 260 / 264)</p>
                <Field label="Place of Publication" name="str8" value={form.str8} onChange={handleChange} hint="str8" />
                <Field label="Publisher" name="str9" value={form.str9} onChange={handleChange} hint="str9" />
                <Field label="Year of Publication" name="str10" value={form.str10} onChange={handleChange} hint="str10" />
                <Field label="Edition Statement" name="str11" value={form.str11} onChange={handleChange} hint="str11" />
              </section>
            )}

            {/* ── Step 3: Access Points ──────────────────────────────────── */}
            {step === 3 && (
              <section className="step-section">
                <h2 className="step-heading">Access Points</h2>
                <p className="step-desc">Subject headings and added entries (MARC 6xx)</p>
                <Field label="Topical Subject" name="str19" value={form.str19} onChange={handleChange} hint="str19" />
                <Field label="Personal Name Subject" name="str20" value={form.str20} onChange={handleChange} hint="str20" />
                <Field label="Corporate Name Subject" name="str21" value={form.str21} onChange={handleChange} hint="str21" />
                <Field label="Geographic Subject" name="str22" value={form.str22} onChange={handleChange} hint="str22" />
              </section>
            )}

            {/* ── Step 4: Physical Description ──────────────────────────── */}
            {step === 4 && (
              <section className="step-section">
                <h2 className="step-heading">Physical Description</h2>
                <p className="step-desc">Extent, illustrations, carrier (MARC 300 / 336–338)</p>
                <Field label="Extent / Pages" name="str12" value={form.str12} onChange={handleChange} hint="str12" />
                <Field label="Illustrative Content" name="str13" value={form.str13} onChange={handleChange} hint="str13" />
                <Field label="Dimensions" name="str14" value={form.str14} onChange={handleChange} hint="str14" />
                <Field label="Accompanying Materials" name="str15" value={form.str15} onChange={handleChange} hint="str15" />
                <Field label="Series Title" name="str16" value={form.str16} onChange={handleChange} hint="str16" />
                <Field label="General Notes" name="str17" value={form.str17} onChange={handleChange} hint="str17" />
                <SelectField label="Content Type" name="str38" value={form.str38} onChange={handleChange}
                  options={["Text", "Still image", "Cartographic image", "Notated music", "Spoken word", "Two-dimensional moving image"]} />
                <SelectField label="Media Type" name="str39" value={form.str39} onChange={handleChange}
                  options={["Unmediated", "Computer", "Microform", "Projected", "Stereographic", "Video"]} />
                <SelectField label="Carrier Type" name="str40" value={form.str40} onChange={handleChange}
                  options={["Volume", "Online resource", "Computer disc", "Microfiche", "Microfilm roll", "Videodisc"]} />
              </section>
            )}

            {/* ── Step 5: Library & Access ───────────────────────────────── */}
            {step === 5 && (
              <section className="step-section">
                <h2 className="step-heading">Library &amp; Access</h2>
                <p className="step-desc">Call number, location, holdings and collection flags</p>
                <Field label="ISBN" name="str18" value={form.str18} onChange={handleChange} hint="str18" />
                <Field label="Call Number Prefix" name="str23" value={form.str23} onChange={handleChange} hint="str23" />
                <Field label="Call Number" name="str24" value={form.str24} onChange={handleChange} hint="str24" />
                <Field label="In-house Coding" name="strCoding" value={form.strCoding} onChange={handleChange} hint="strCoding" />
                <Field label="Accession Number" name="str25" value={form.str25} onChange={handleChange} hint="str25" />
                <Field label="Copy Count" name="str29" value={form.str29} onChange={handleChange} hint="str29" />
                <Field label="Copies In" name="str30" value={form.str30} onChange={handleChange} hint="str30" />
                <Field label="Copies Out" name="str31" value={form.str31} onChange={handleChange} hint="str31" />
                <Field label="Times Out" name="str35" value={form.str35} onChange={handleChange} hint="str35" />
                <SelectField label="Language" name="str26" value={form.str26} onChange={handleChange}
                  options={["English", "Filipino", "French", "Spanish", "Chinese", "Japanese", "Other"]} />
                <SelectField label="Branch / Location" name="str27" value={form.str27} onChange={handleChange}
                  options={["CIRCULATION", "REFERENCE", "FILIPINIANA", "SPECIAL COLLECTION", "RESERVE"]} />
                <Field label="Electronic Access / Filename" name="str28" value={form.str28} onChange={handleChange} hint="str28" />
                <Field label="URL" name="str37" value={form.str37} onChange={handleChange} hint="str37" />
                <Field label="Cover Image Filename" name="str41" value={form.str41} onChange={handleChange} hint="str41" />

                <CheckboxGroup
                  legend="Collection / Classification Flags"
                  items={collectionItems}
                  values={form}
                  onChange={handleCheck}
                />
              </section>
            )}

            {/* ── Step 6: Notes & Acquisition ───────────────────────────── */}
            {step === 6 && (
              <section className="step-section">
                <h2 className="step-heading">Notes &amp; Acquisition</h2>
                <p className="step-desc">Descriptive notes, abstract, and acquisition metadata</p>
                <TextArea label="Content Notes" name="str32" value={form.str32} onChange={handleChange} hint="str32" />
                <TextArea label="Summary" name="str33" value={form.str33} onChange={handleChange} hint="str33" />
                <TextArea label="Abstract" name="str34" value={form.str34} onChange={handleChange} hint="str34" />
                
                <SelectField label="Acquisition Mode" name="strAcquisitionMode" value={form.strAcquisitionMode}
                  onChange={handleChange} options={["", "Purchase", "Donation", "Exchange", "Transfer"]} />
                <Field label="Donor" name="strDonor" value={form.strDonor} onChange={handleChange} />
              </section>
            )}

            {/* ── Step 7: Review & Submit ────────────────────────────────── */}
            {step === 7 && (
              <section className="step-section">
                <h2 className="step-heading">Review &amp; Submit</h2>
                <p className="step-desc">Confirm all details before saving to the catalog</p>

                <div className="preview-card">
                  <div className="preview-section-label">Title &amp; Authorship</div>
                  <PreviewRow label="Title" value={form.str0} />
                  <PreviewRow label="Statement of Responsibility" value={form.str1} />
                  <PreviewRow label="Parallel Title" value={form.str2} />
                  <PreviewRow label="Variant Title" value={form.str36} />
                  <PreviewRow label="Main Author" value={form.str3} />
                  <PreviewRow label="Numeration" value={form.str4} />
                  <PreviewRow label="Other Author" value={form.str5} />
                  <PreviewRow label="Contributors" value={form.str6} />
                  <PreviewRow label="Corporate Body" value={form.str7} />

                  <div className="preview-section-label">Publication</div>
                  <PreviewRow label="Place" value={form.str8} />
                  <PreviewRow label="Publisher" value={form.str9} />
                  <PreviewRow label="Year" value={form.str10} />
                  <PreviewRow label="Edition" value={form.str11} />

                  <div className="preview-section-label">Access Points</div>
                  <PreviewRow label="Topical" value={form.str19} />
                  <PreviewRow label="Personal" value={form.str20} />
                  <PreviewRow label="Corporate" value={form.str21} />
                  <PreviewRow label="Geographical" value={form.str22} />

                  <div className="preview-section-label">Physical Description</div>
                  <PreviewRow label="Extent" value={form.str12} />
                  <PreviewRow label="Illustrations" value={form.str13} />
                  <PreviewRow label="Dimensions" value={form.str14} />
                  <PreviewRow label="Accompanying Materials" value={form.str15} />
                  <PreviewRow label="Series" value={form.str16} />
                  <PreviewRow label="Notes" value={form.str17} />
                  <PreviewRow label="Content Type" value={form.str38} />
                  <PreviewRow label="Media Type" value={form.str39} />
                  <PreviewRow label="Carrier Type" value={form.str40} />

                  <div className="preview-section-label">Library &amp; Access</div>
                  <PreviewRow label="ISBN" value={form.str18} />
                  <PreviewRow label="Call Number" value={`${form.str23} ${form.strCoding} ${form.str24}`.trim()} />
                  <PreviewRow label="Accession" value={form.str25} />
                  <PreviewRow label="Copy Count" value={form.str29} />
                  <PreviewRow label="Language" value={form.str26} />
                  <PreviewRow label="Location " value={form.str27} />
                  <PreviewRow label="URL" value={form.str37} />
                  <PreviewRow label="General Circulation" value={form.gc} />
                  <PreviewRow label="Reference" value={form.ref} />
                  <PreviewRow label="Filipiniana" value={form.fil} />
                  <PreviewRow label="Restricted" value={form.con} />

                  <div className="preview-section-label">Notes &amp; Acquisition</div>
                  <PreviewRow label="Abstract" value={form.str34} />
                  <PreviewRow label="Summary" value={form.str33} />
                  <PreviewRow label="Acquisition Mode" value={form.strAcquisitionMode} />
                  <PreviewRow label="Donor" value={form.strDonor} />
                </div>

                {status === "error" && (
                  <div className="error-banner">
                    ⚠ Save failed: {errorMsg || "Please try again."}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Navigation */}
          <div className="nav-bar">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep(s => s - 1)}
              className="btn-secondary"
            >
              ← Back
            </button>

            <span className="nav-counter">{step} / {STEPS.length}</span>

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setStep(s => s + 1); }}
                className="btn-primary"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                disabled={status === "loading"}
                onClick={handleSubmit}
                className="btn-submit"
              >
                {status === "loading" ? "Saving…" : "Save to Catalog ✓"}
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,400&display=swap');

  :root {
    --ink:       #1a1814;
    --ink2:      #3d3830;
    --ink3:      #6b6355;
    --parchment: #f7f3ec;
    --cream:     #ede8de;
    --rule:      #d5cfc3;
    --accent:    #8b3a2a;
    --accent2:   #c45e3e;
    --done:      #2d6a4f;
    --white:     #ffffff;
    --shadow:    0 2px 12px rgba(26,24,20,0.10);
    --shadow-lg: 0 8px 32px rgba(26,24,20,0.14);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .catalog-shell {
    font-family: 'Source Serif 4', Georgia, serif;
    background: var(--parchment);
    min-height: 100vh;
    color: var(--ink);
  }

  /* ── Header ── */
  .catalog-header {
    background: var(--ink);
    padding: 28px 32px 24px;
    border-bottom: 4px solid var(--accent);
  }
  .catalog-header-inner { max-width: 860px; margin: auto; }
  .catalog-badge {
    display: inline-block;
    font-size: 10px;
    font-family: 'Source Serif 4', serif;
    letter-spacing: 0.22em;
    color: var(--accent2);
    text-transform: uppercase;
    margin-bottom: 6px;
    font-weight: 600;
  }
  .catalog-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(22px, 4vw, 30px);
    font-weight: 700;
    color: var(--white);
    line-height: 1.2;
  }

  /* ── Step rail ── */
  .step-rail {
    background: var(--cream);
    border-bottom: 1px solid var(--rule);
    padding: 14px 32px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 100%;
    overflow-x: auto;
  }
  .step-pill {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    border-radius: 4px;
    border: 1px solid var(--rule);
    background: transparent;
    cursor: default;
    font-family: 'Source Serif 4', serif;
    font-size: 12px;
    color: var(--ink3);
    transition: all 0.18s;
    white-space: nowrap;
  }
  .step-pill--active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--white);
    cursor: default;
    box-shadow: var(--shadow);
  }
  .step-pill--done {
    background: var(--done);
    border-color: var(--done);
    color: var(--white);
    cursor: pointer;
  }
  .step-pill--done:hover { opacity: 0.85; }
  .step-num {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    opacity: 0.75;
  }
  .step-pill--active .step-num,
  .step-pill--done .step-num { opacity: 1; }
  .step-text { font-size: 12px; }

  /* ── Body ── */
  .catalog-body {
    max-width: 860px;
    margin: 32px auto;
    padding: 0 20px 48px;
  }

  .step-card {
    background: var(--white);
    border: 1px solid var(--rule);
    border-radius: 6px;
    box-shadow: var(--shadow);
    padding: 36px 40px;
    margin-bottom: 20px;
  }

  .step-section { display: flex; flex-direction: column; gap: 18px; }
  .step-heading {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--ink);
    padding-bottom: 10px;
    border-bottom: 2px solid var(--accent);
  }
  .step-desc {
    font-size: 13px;
    color: var(--ink3);
    font-style: italic;
    margin-top: -8px;
  }

  /* ── Fields ── */
  .field-row {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 10px 20px;
    align-items: start;
  }
  @media (max-width: 600px) {
    .field-row { grid-template-columns: 1fr; }
    .step-card { padding: 22px 18px; }
  }

  .field-label {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ink2);
    padding-top: 8px;
    line-height: 1.4;
  }
  .required-mark { color: var(--accent); margin-left: 3px; }
  .field-hint { font-size: 11px; color: var(--ink3); font-weight: 400; font-style: italic; }

  .field-input,
  .field-textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--rule);
    border-radius: 4px;
    background: var(--parchment);
    font-family: 'Source Serif 4', serif;
    font-size: 14px;
    color: var(--ink);
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
  }
  .field-input:focus,
  .field-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(139,58,42,0.12);
    background: var(--white);
  }
  .field-textarea { resize: vertical; min-height: 90px; }

  /* ── Checkbox group ── */
  .checkbox-group {
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: 18px 20px;
    background: var(--parchment);
  }
  .checkbox-legend {
    font-size: 13px;
    font-weight: 700;
    color: var(--ink2);
    margin-bottom: 14px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
  }
  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13.5px;
    color: var(--ink2);
  }
  .checkbox-input {
    width: 15px; height: 15px;
    accent-color: var(--accent);
    cursor: pointer;
    flex-shrink: 0;
  }

  /* ── Preview ── */
  .preview-card {
    border: 1px solid var(--rule);
    border-radius: 4px;
    overflow: hidden;
    background: var(--parchment);
  }
  .preview-section-label {
    background: var(--cream);
    padding: 8px 16px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--ink3);
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
    margin-top: 0;
  }
  .preview-section-label:first-child { border-top: none; }
  .preview-row {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 12px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--rule);
    font-size: 13.5px;
  }
  .preview-row:last-child { border-bottom: none; }
  .preview-label { color: var(--ink3); font-weight: 600; }
  .preview-value { color: var(--ink); word-break: break-word; }

  /* ── Nav bar ── */
  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
  }
  .nav-counter {
    font-size: 12px;
    color: var(--ink3);
    letter-spacing: 0.06em;
    font-style: italic;
  }

  /* ── Buttons ── */
  .btn-primary, .btn-secondary, .btn-submit {
    padding: 10px 24px;
    border-radius: 4px;
    font-family: 'Source Serif 4', serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
  }
  .btn-secondary {
    background: var(--white);
    color: var(--ink2);
    border: 1px solid var(--rule);
  }
  .btn-secondary:hover:not(:disabled) { background: var(--cream); }
  .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary {
    background: var(--accent);
    color: var(--white);
    box-shadow: var(--shadow);
  }
  .btn-primary:hover { background: var(--accent2); }
  .btn-submit {
    background: var(--done);
    color: var(--white);
    padding: 10px 30px;
    box-shadow: var(--shadow);
    letter-spacing: 0.03em;
  }
  .btn-submit:hover:not(:disabled) { filter: brightness(1.1); }
  .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── Error ── */
  .error-banner {
    margin-top: 16px;
    padding: 12px 16px;
    background: #fdf2f0;
    border: 1px solid #e8a090;
    border-radius: 4px;
    color: var(--accent);
    font-size: 13.5px;
    font-weight: 600;
  }

  /* ── Success screen ── */
  .success-screen {
    font-family: 'Source Serif 4', serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 16px;
    padding: 40px;
    text-align: center;
  }
  .success-icon {
    width: 72px; height: 72px;
    background: var(--done);
    color: var(--white);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    box-shadow: var(--shadow-lg);
  }
  .success-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    color: var(--ink);
  }
  .success-sub { color: var(--ink3); font-size: 15px; font-style: italic; }
`;