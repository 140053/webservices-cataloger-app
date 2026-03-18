"use client";

import { APIMasterPostWithJSON } from "@/utils/book";
import { useState } from "react";

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
  strCoding: string; // In-house coding
  con: boolean;   // Restricted
  tdID: string;
  isUpdate: boolean;
};

const defaultForm: ThesisForm = {
  str0: "",
  str1: "",
  str2: "",
  str3: "",
  str4: "",
  str5: "",
  str6: "",
  str7: "",
  str8: "English",
  str9: "",
  str10: "",
  str11: "",
  str12: "",
  str13: "1",
  str14: "1",
  str15: "0",
  str16: "",
  str17: "",
  str18: "",
  str19: "",
  strCoding: "",
  con: false,
  tdID: "",
  isUpdate: false,
};

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Title & Creators",      icon: "01" },
  { label: "Institution & Type",    icon: "02" },
  { label: "Physical Details",      icon: "03" },
  { label: "Library & Access",      icon: "04" },
  { label: "Abstract & Notes",      icon: "05" },
  { label: "Review & Submit",       icon: "06" },
];

const THESIS_TYPES = [
  "",
  "Thesis",
  "Business plan",
  "Case study",
  "Dissertation",
  "Feasibility study",
  "Special problem",
  "Strategic plan",
  "Research project",
  "Master Thesis",
  "Narrative Report",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMaintext(form: ThesisForm): string {
  const pairs: [string, string][] = [
    ["001",  form.str0],
    ["002",  form.str1],
    ["003",  form.str2],
    ["004",  form.str3],
    ["005",  form.str4],
    ["006",  form.str5],
    ["007",  form.str6],
    ["008",  form.str7],
    ["009",  form.str8],
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
  ];
  return pairs
    .map(([tag, val]) => `<${tag}>${val.trim()}`)
    .join("")
    .replace(/\\/g, "/");
}

function buildPayload(form: ThesisForm) {
  const title = form.str0;
  const maintext = buildMaintext(form)
    .replace(/"/g, "")
    .replace(/'/g, "`");

  const now = new Date().toISOString();

  return {
    Title: title,
    Maintext: maintext,

    Copy: parseInt(form.str13) || 0,
    Inn:  parseInt(form.str14) || 0,
    t_Out: 0,
    t_TimesOut: 0,

    tm: "td",

    restricted: form.con ? 1 : 0,
    filsts: null,
    coding: form.strCoding || null,
    branch: "Library",

    entered_by: "library",
    date_entered: now,
    updated_by: "library",

    ...(form.isUpdate ? { bkID: form.tdID, date_updated: now } : {}),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label, name, value, onChange, required, hint,
}: {
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

function TextArea({
  label, name, value, onChange, hint, rows = 4,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  hint?: string; rows?: number;
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
        rows={rows}
      />
    </div>
  );
}

function SelectField({
  label, name, value, onChange, options, hint,
}: {
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
        {options.map(o => (
          <option key={o} value={o}>{o || "— select —"}</option>
        ))}
      </select>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string | boolean }) {
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  if (!display || display === "false" || display === "No") return null;
  return (
    <div className="preview-row">
      <span className="preview-label">{label}</span>
      <span className="preview-value">{display || "—"}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ThesisCatalogForm() {
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState<ThesisForm>(defaultForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleCheck(key: keyof ThesisForm, checked: boolean) {
    setForm(prev => ({ ...prev, [key]: checked }));
  }

  async function handleSubmit(e?: React.FormEvent | React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    if (step !== STEPS.length) return;
    if (!form.str0.trim()) { alert("Title is required."); setStep(1); return; }

    setStatus("loading");
    setErrorMsg("");

    try {
      const payload = buildPayload(form);
      const ress = await APIMasterPostWithJSON(`/thesis/save`, payload);
      console.log(ress);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <>
        <style>{CSS}</style>
        <div className="success-screen">
          <div className="success-icon">✓</div>
          <h2 className="success-title">Entry Saved</h2>
          <p className="success-sub">"{form.str0}" has been successfully catalogued.</p>
          <button
            className="btn-primary"
            onClick={() => { setForm(defaultForm); setStep(1); setStatus("idle"); }}
          >
            Add Another Entry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="catalog-shell">

        {/* ── Header ── */}
        <header className="catalog-header">
          <div className="catalog-header-inner">
            <span className="catalog-badge">CATALOGUING MODULE</span>
            <h1 className="catalog-title">Academic Coursework, Research &amp; Thesis Entry</h1>
          </div>
        </header>

        {/* ── Step rail ── */}
        <nav className="step-rail">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const state = n < step ? "done" : n === step ? "active" : "idle";
            return (
              <button
                key={n}
                type="button"
                className={`step-pill step-pill--${state}`}
                onClick={() => n < step && setStep(n)}
                disabled={n > step}
              >
                <span className="step-num">{n < step ? "✓" : s.icon}</span>
                <span className="step-text">{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Form body ── */}
        <div className="catalog-body">
          <div className="step-card">

            {/* ── Step 1: Title & Creators ──────────────────────────────── */}
            {step === 1 && (
              <section className="step-section">
                <h2 className="step-heading">Title &amp; Creators</h2>
                <p className="step-desc">Primary identification of the academic work</p>
                <Field label="Title" name="str0" value={form.str0} onChange={handleChange} required hint="str0" />
                <Field label="Creator(s) / Author(s)" name="str1" value={form.str1} onChange={handleChange} hint="str1" />
              </section>
            )}

            {/* ── Step 2: Institution & Type ────────────────────────────── */}
            {step === 2 && (
              <section className="step-section">
                <h2 className="step-heading">Institution &amp; Type</h2>
                <p className="step-desc">Academic context and classification</p>
                <Field label="Institution" name="str2" value={form.str2} onChange={handleChange} hint="str2" />
                <Field label="Course / Program" name="str3" value={form.str3} onChange={handleChange} hint="str3" />
                <Field label="Date / Year" name="str4" value={form.str4} onChange={handleChange} hint="str4" />
                <SelectField
                  label="Type of Work"
                  name="str16"
                  value={form.str16}
                  onChange={handleChange}
                  options={THESIS_TYPES}
                  hint="str16"
                />
                <Field label="Subjects / Keywords" name="str11" value={form.str11} onChange={handleChange} hint="str11" />
              </section>
            )}

            {/* ── Step 3: Physical Details ──────────────────────────────── */}
            {step === 3 && (
              <section className="step-section">
                <h2 className="step-heading">Physical Details</h2>
                <p className="step-desc">Extent, illustrations, and material description</p>
                <Field label="Extent of Material" name="str5" value={form.str5} onChange={handleChange} hint="str5" />
                <Field label="Illustrative Details" name="str17" value={form.str17} onChange={handleChange} hint="str17" />
                <Field label="Dimension" name="str18" value={form.str18} onChange={handleChange} hint="str18" />
                <Field label="Supplementary Content" name="str19" value={form.str19} onChange={handleChange} hint="str19" />
              </section>
            )}

            {/* ── Step 4: Library & Access ──────────────────────────────── */}
            {step === 4 && (
              <section className="step-section">
                <h2 className="step-heading">Library &amp; Access</h2>
                <p className="step-desc">Call number, location, holdings, and access details</p>
                <Field label="Call Number" name="str6" value={form.str6} onChange={handleChange} hint="str6" />
                <Field label="In-house Coding" name="strCoding" value={form.strCoding} onChange={handleChange} />
                <Field label="Accession Number" name="str7" value={form.str7} onChange={handleChange} hint="str7" />
                <SelectField
                  label="Language"
                  name="str8"
                  value={form.str8}
                  onChange={handleChange}
                  options={["English", "Filipino", "French", "Spanish", "Chinese", "Japanese", "Other"]}
                />
                <Field label="Location" name="str9" value={form.str9} onChange={handleChange} hint="str9" />
                <Field label="Electronic Access / E-file" name="str10" value={form.str10} onChange={handleChange} hint="str10" />
                <Field label="Copy Count" name="str13" value={form.str13} onChange={handleChange} hint="str13" />
                <Field label="On-shelf" name="str14" value={form.str14} onChange={handleChange} hint="str14" />
                <Field label="Out" name="str15" value={form.str15} onChange={handleChange} hint="str15" />

                <div className="checkbox-group">
                  <p className="checkbox-legend">Type of Material</p>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={form.con}
                      onChange={e => handleCheck("con", e.target.checked)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-label">Restricted</span>
                  </label>
                </div>
              </section>
            )}

            {/* ── Step 5: Abstract & Notes ──────────────────────────────── */}
            {step === 5 && (
              <section className="step-section">
                <h2 className="step-heading">Abstract &amp; Notes</h2>
                <p className="step-desc">Full abstract and additional descriptive notes</p>
                <TextArea
                  label="Abstract"
                  name="str12"
                  value={form.str12}
                  onChange={handleChange}
                  hint="str12"
                  rows={10}
                />
              </section>
            )}

            {/* ── Step 6: Review & Submit ───────────────────────────────── */}
            {step === 6 && (
              <section className="step-section">
                <h2 className="step-heading">Review &amp; Submit</h2>
                <p className="step-desc">Confirm all details before saving to the catalog</p>

                <div className="preview-card">
                  <div className="preview-section-label">Title &amp; Creators</div>
                  <PreviewRow label="Title"           value={form.str0} />
                  <PreviewRow label="Creator(s)"      value={form.str1} />

                  <div className="preview-section-label">Institution &amp; Type</div>
                  <PreviewRow label="Institution"     value={form.str2} />
                  <PreviewRow label="Course / Program" value={form.str3} />
                  <PreviewRow label="Date / Year"     value={form.str4} />
                  <PreviewRow label="Type of Work"    value={form.str16} />
                  <PreviewRow label="Keywords"        value={form.str11} />

                  <div className="preview-section-label">Physical Details</div>
                  <PreviewRow label="Extent"          value={form.str5} />
                  <PreviewRow label="Illustrations"   value={form.str17} />
                  <PreviewRow label="Dimension"       value={form.str18} />
                  <PreviewRow label="Supplementary"   value={form.str19} />

                  <div className="preview-section-label">Library &amp; Access</div>
                  <PreviewRow label="Call Number"     value={`${form.str6} ${form.strCoding}`.trim()} />
                  <PreviewRow label="Accession"       value={form.str7} />
                  <PreviewRow label="Language"        value={form.str8} />
                  <PreviewRow label="Location"        value={form.str9} />
                  <PreviewRow label="Electronic Access" value={form.str10} />
                  <PreviewRow label="Copy Count"      value={form.str13} />
                  <PreviewRow label="On-shelf"        value={form.str14} />
                  <PreviewRow label="Restricted"      value={form.con} />

                  <div className="preview-section-label">Abstract</div>
                  <PreviewRow label="Abstract"        value={form.str12} />
                </div>

                {status === "error" && (
                  <div className="error-banner">
                    ⚠ Save failed: {errorMsg || "Please try again."}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* ── Navigation ── */}
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
        </div>
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
    --accent:    #2a4a8b;
    --accent2:   #3e6ec4;
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
    font-size: clamp(18px, 3.5vw, 26px);
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
    box-shadow: var(--shadow);
  }
  .step-pill--done {
    background: var(--done);
    border-color: var(--done);
    color: var(--white);
    cursor: pointer;
  }
  .step-pill--done:hover { opacity: 0.85; }
  .step-num { font-size: 10px; font-weight: 700; letter-spacing: 0.05em; opacity: 0.75; }
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
  .step-desc { font-size: 13px; color: var(--ink3); font-style: italic; margin-top: -8px; }

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
    box-shadow: 0 0 0 3px rgba(42,74,139,0.12);
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
  .nav-counter { font-size: 12px; color: var(--ink3); letter-spacing: 0.06em; font-style: italic; }

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
  .btn-primary { background: var(--accent); color: var(--white); box-shadow: var(--shadow); }
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
    background: #f0f2fd;
    border: 1px solid #90a0e8;
    border-radius: 4px;
    color: var(--accent);
    font-size: 13.5px;
    font-weight: 600;
  }

  /* ── Success ── */
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
  .success-title { font-family: 'Playfair Display', serif; font-size: 26px; color: var(--ink); }
  .success-sub { color: var(--ink3); font-size: 15px; font-style: italic; }
`;