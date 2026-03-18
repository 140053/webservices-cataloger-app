"use client";

import { APIMasterPostWithJSON } from "@/utils/book";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PeriodicalForm = {
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
  con: boolean;   // Restricted
  bkID: string;
  isUpdate: boolean;
};

const defaultForm: PeriodicalForm = {
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
  con: false,
  bkID: "",
  isUpdate: false,
};

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Article & Authors",   icon: "01" },
  { label: "Periodical Details",  icon: "02" },
  { label: "Classification",      icon: "03" },
  { label: "Access & Location",   icon: "04" },
  { label: "Abstract & Keywords", icon: "05" },
  { label: "Review & Submit",     icon: "06" },
];

const ARTICLE_TYPES = [
  "",
  "Article",
  "Book review",
  "Case study",
  "Commentary",
  "Correspondence",
  "Discussion article",
  "Editorial",
  "Essay",
  "Featured article",
  "Interview",
  "Lesson plan",
  "Newspaper article",
  "Opinion",
  "Poem",
  "Research article",
  "Research communication",
  "Review article",
  "Short story",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMaintext(form: PeriodicalForm): string {
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
  ];
  return pairs
    .map(([tag, val]) => `<${tag}>${val.trim()}`)
    .join("")
    .replace(/\\/g, "/");
}

function buildPayload(form: PeriodicalForm) {
  const title    = form.str0;
  const maintext = buildMaintext(form)
    .replace(/"/g, "")
    .replace(/'/g, "`");

  const now = new Date().toISOString();

  return {
    Title:    title,
    Maintext: maintext,
    tm:       "pr",

    images: null,
    t_Out: 0,
    t_TimesOut: 0,
    Copy: 0,
    Inn: 0,

    gc:  0,
    tr:  0,
    easy:  0,
    circ:  0,
    fr:  0,
    sm:  0,
    schl:  0,
    coding: null,

    restricted: form.con ? 1 : 0,
    filsts:     null,
    branch:     "Library",

    entered_by:   "library",
    date_entered: now,
    updated_by:   "library",

    ...(form.isUpdate ? { bkID: form.bkID, date_updated: now } : {}),
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
  label, name, value, onChange, hint, rows = 5,
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

export default function PeriodicalCatalogForm() {
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState<PeriodicalForm>(defaultForm);
  const [status, setStatus]     = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleCheck(key: keyof PeriodicalForm, checked: boolean) {
    setForm(prev => ({ ...prev, [key]: checked }));
  }

  async function handleSubmit(e?: React.FormEvent | React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    if (step !== STEPS.length) return;
    if (!form.str0.trim()) { alert("Article title is required."); setStep(1); return; }

    setStatus("loading");
    setErrorMsg("");

    try {
      const payload = buildPayload(form);
      console.log(payload)
      const ress = await APIMasterPostWithJSON(`/serials/save`, payload);
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
          <h2 className="success-title">Index Entry Saved</h2>
          <p className="success-sub">"{form.str0}" has been successfully indexed.</p>
          <button
            className="btn-primary"
            onClick={() => {
              // Preserve periodical context (title, volume, issue, date) — mirrors ASP session behaviour
              setForm(prev => ({
                ...defaultForm,
                str2: prev.str2,
                str3: prev.str3,
                str4: prev.str4,
                str5: prev.str5,
              }));
              setStep(1);
              setStatus("idle");
            }}
          >
            Add Another Article
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
            <span className="catalog-badge">INDEXING MODULE</span>
            <h1 className="catalog-title">Periodical Article Indexing</h1>
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

            {/* ── Step 1: Article & Authors ─────────────────────────────── */}
            {step === 1 && (
              <section className="step-section">
                <h2 className="step-heading">Article &amp; Authors</h2>
                <p className="step-desc">Primary identification of the article</p>
                <Field
                  label="Article Title" name="str0" value={form.str0}
                  onChange={handleChange} required hint="str0"
                />
                <Field
                  label="Creator(s) / Author(s)" name="str1" value={form.str1}
                  onChange={handleChange} hint="str1"
                />
              </section>
            )}

            {/* ── Step 2: Periodical Details ────────────────────────────── */}
            {step === 2 && (
              <section className="step-section">
                <h2 className="step-heading">Periodical Details</h2>
                <p className="step-desc">Source publication information</p>
                <Field
                  label="Periodical Title" name="str2" value={form.str2}
                  onChange={handleChange} hint="str2"
                />
                <Field
                  label="Volume" name="str3" value={form.str3}
                  onChange={handleChange} hint="str3"
                />
                <Field
                  label="Issue / Number" name="str4" value={form.str4}
                  onChange={handleChange} hint="str4"
                />
                <Field
                  label="Date" name="str5" value={form.str5}
                  onChange={handleChange} hint="str5"
                />
                <Field
                  label="Pages" name="str6" value={form.str6}
                  onChange={handleChange} hint="str6"
                />
              </section>
            )}

            {/* ── Step 3: Classification ────────────────────────────────── */}
            {step === 3 && (
              <section className="step-section">
                <h2 className="step-heading">Classification</h2>
                <p className="step-desc">Article type and material designation</p>
                <SelectField
                  label="Type of Article" name="str7" value={form.str7}
                  onChange={handleChange} options={ARTICLE_TYPES} hint="str7"
                />
                <SelectField
                  label="Language" name="str8" value={form.str8}
                  onChange={handleChange}
                  options={["English", "Filipino", "French", "Spanish", "Chinese", "Japanese", "Other"]}
                />
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

            {/* ── Step 4: Access & Location ─────────────────────────────── */}
            {step === 4 && (
              <section className="step-section">
                <h2 className="step-heading">Access &amp; Location</h2>
                <p className="step-desc">Physical and electronic access details</p>
                <Field
                  label="Location" name="str9" value={form.str9}
                  onChange={handleChange} hint="str9"
                />
                <Field
                  label="Electronic Access" name="str10" value={form.str10}
                  onChange={handleChange} hint="str10"
                />
              </section>
            )}

            {/* ── Step 5: Abstract & Keywords ───────────────────────────── */}
            {step === 5 && (
              <section className="step-section">
                <h2 className="step-heading">Abstract &amp; Keywords</h2>
                <p className="step-desc">Subject access and descriptive summary</p>
                <Field
                  label="Subject / Keywords" name="str11" value={form.str11}
                  onChange={handleChange} hint="str11"
                />
                <TextArea
                  label="Abstract" name="str12" value={form.str12}
                  onChange={handleChange} hint="str12" rows={8}
                />
              </section>
            )}

            {/* ── Step 6: Review & Submit ───────────────────────────────── */}
            {step === 6 && (
              <section className="step-section">
                <h2 className="step-heading">Review &amp; Submit</h2>
                <p className="step-desc">Confirm all details before saving to the index</p>

                <div className="preview-card">
                  <div className="preview-section-label">Article &amp; Authors</div>
                  <PreviewRow label="Article Title"  value={form.str0} />
                  <PreviewRow label="Creator(s)"     value={form.str1} />

                  <div className="preview-section-label">Periodical Details</div>
                  <PreviewRow label="Periodical"     value={form.str2} />
                  <PreviewRow label="Volume"         value={form.str3} />
                  <PreviewRow label="Issue / Number" value={form.str4} />
                  <PreviewRow label="Date"           value={form.str5} />
                  <PreviewRow label="Pages"          value={form.str6} />

                  <div className="preview-section-label">Classification</div>
                  <PreviewRow label="Type"           value={form.str7} />
                  <PreviewRow label="Language"       value={form.str8} />
                  <PreviewRow label="Restricted"     value={form.con} />

                  <div className="preview-section-label">Access &amp; Location</div>
                  <PreviewRow label="Location"           value={form.str9} />
                  <PreviewRow label="Electronic Access"  value={form.str10} />

                  <div className="preview-section-label">Abstract &amp; Keywords</div>
                  <PreviewRow label="Keywords" value={form.str11} />
                  <PreviewRow label="Abstract" value={form.str12} />
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
                {status === "loading" ? "Saving…" : "Save to Index ✓"}
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
    --accent:    #4a6741;
    --accent2:   #6a9460;
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
    box-shadow: 0 0 0 3px rgba(74,103,65,0.12);
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
    background: #f0fdf4;
    border: 1px solid #90c8a0;
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