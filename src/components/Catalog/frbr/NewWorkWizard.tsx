"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import {
  createWork,
  createAgent,
  addWorkAgent,
  createSubject,
  addWorkSubject,
  createClassification,
  addWorkClassification,
  createCallnumber,
  createExpression,
  createManifestation,
  createItem,
} from "@/utils/cataloging";
import { X, Plus, CheckCircle2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentEntry = { name: string; type: "PERSON" | "CORPORATE"; role: "AUTHOR" | "ADVISER" | "EDITOR" | "PUBLISHER" };
type SubjectEntry = { term: string };

const STEPS = [
  { number: 1, label: "Work" },
  { number: 2, label: "Agents & Subjects" },
  { number: 3, label: "Expression" },
  { number: 4, label: "Manifestation" },
  { number: 5, label: "Item" },
];

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.number} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                current > s.number
                  ? "bg-stone-800 text-white"
                  : current === s.number
                  ? "bg-stone-700 text-white ring-2 ring-stone-400 ring-offset-2"
                  : "bg-stone-100 text-stone-400"
              }`}
            >
              {current > s.number ? <CheckCircle2 className="w-4 h-4" /> : s.number}
            </div>
            <span className={`text-[11px] whitespace-nowrap ${current === s.number ? "text-stone-700 font-medium" : "text-stone-400"}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-10 mb-5 mx-1 ${current > s.number ? "bg-stone-700" : "bg-stone-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function NewWorkWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // IDs created at each step
  const [workId, setWorkId] = useState<number | null>(null);
  const [expressionId, setExpressionId] = useState<number | null>(null);
  const [manifestationId, setManifestationId] = useState<number | null>(null);
  const [createdWorkId, setCreatedWorkId] = useState<number | null>(null);

  // ── Step 1: Work ────────────────────────────────────────────────────────────
  const [work, setWork] = useState({
    title: "",
    type: "" as "BOOK" | "THESIS" | "DISSERTATION" | "",
    formOfWork: "",
    dateOfWork: "",
    summary: "",
  });

  // ── Step 2: Agents, Subjects, Classification, Call Number ───────────────────
  const [agents, setAgents] = useState<AgentEntry[]>([]);
  const [agentDraft, setAgentDraft] = useState<AgentEntry>({ name: "", type: "PERSON", role: "AUTHOR" });

  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);
  const [subjectDraft, setSubjectDraft] = useState("");

  const [classification, setClassification] = useState({ scheme: "" as "LCC" | "DDC" | "", code: "", description: "" });
  const [callnumber, setCallnumber] = useState({ scheme: "" as "LCC" | "DDC" | "", classNumber: "", cutter: "", year: "", callNumber: "" });

  // ── Step 3: Expression ──────────────────────────────────────────────────────
  const [expression, setExpression] = useState({
    language: "English",
    contentType: "TEXT" as "TEXT",
    formOfExpression: "",
    extent: "",
  });

  // ── Step 4: Manifestation ───────────────────────────────────────────────────
  const [manifestation, setManifestation] = useState({
    publisher: "",
    placeOfPublication: "",
    dateOfPublication: "",
    editionStatement: "",
    isbn: "",
    mediaType: "UNMEDIATED" as "UNMEDIATED" | "COMPUTER",
    carrierType: "VOLUME" as "VOLUME" | "ONLINE_RESOURCE",
  });

  // ── Step 5: Item ────────────────────────────────────────────────────────────
  const [item, setItem] = useState({
    accessionNumber: "",
    barcode: "",
    shelfLocation: "",
    conditionNote: "",
    isDigital: false,
    fileUrl: "",
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function addAgent() {
    if (!agentDraft.name.trim()) return;
    setAgents(prev => [...prev, { ...agentDraft }]);
    setAgentDraft({ name: "", type: "PERSON", role: "AUTHOR" });
  }

  function removeAgent(i: number) {
    setAgents(prev => prev.filter((_, idx) => idx !== i));
  }

  function addSubject() {
    if (!subjectDraft.trim()) return;
    setSubjects(prev => [...prev, { term: subjectDraft.trim() }]);
    setSubjectDraft("");
  }

  function removeSubject(i: number) {
    setSubjects(prev => prev.filter((_, idx) => idx !== i));
  }

  // ─── Submit per step ────────────────────────────────────────────────────────

  async function submitStep1() {
    if (!work.title.trim() || !work.type) {
      toast.error("Title and type are required.");
      return;
    }
    setLoading(true);
    try {
      const created = await createWork({
        title: work.title.trim(),
        type: work.type,
        formOfWork: work.formOfWork || undefined,
        summary: work.summary || undefined,
        dateOfWork: work.dateOfWork ? Number(work.dateOfWork) : undefined,
      });
      setWorkId(created.id as number);
      setCreatedWorkId(created.id as number);
      setStep(2);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create work.");
    } finally {
      setLoading(false);
    }
  }

  async function submitStep2() {
    if (!workId) return;
    setLoading(true);
    try {
      // Create and link each agent
      for (const a of agents) {
        const agent = await createAgent({ name: a.name, type: a.type });
        await addWorkAgent(workId, agent.id as number, a.role);
      }
      // Create and link each subject
      for (const s of subjects) {
        const subject = await createSubject(s.term);
        await addWorkSubject(workId, subject.id as number);
      }
      // Classification (optional)
      if (classification.scheme && classification.code.trim()) {
        const cls = await createClassification({
          scheme: classification.scheme,
          code: classification.code.trim(),
          description: classification.description || undefined,
        });
        await addWorkClassification(workId, cls.id as number);
      }
      // Call number (optional)
      if (callnumber.scheme && callnumber.classNumber.trim() && callnumber.callNumber.trim()) {
        await createCallnumber(workId, {
          scheme: callnumber.scheme,
          classNumber: callnumber.classNumber.trim(),
          cutter: callnumber.cutter || undefined,
          year: callnumber.year ? Number(callnumber.year) : undefined,
          callNumber: callnumber.callNumber.trim(),
        });
      }
      setStep(3);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save agents/subjects.");
    } finally {
      setLoading(false);
    }
  }

  async function submitStep3() {
    if (!workId || !expression.language.trim()) {
      toast.error("Language is required.");
      return;
    }
    setLoading(true);
    try {
      const created = await createExpression(workId, {
        language: expression.language.trim(),
        contentType: expression.contentType,
        formOfExpression: expression.formOfExpression || undefined,
        extent: expression.extent || undefined,
      });
      setExpressionId(created.id as number);
      setStep(4);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create expression.");
    } finally {
      setLoading(false);
    }
  }

  async function submitStep4() {
    if (!expressionId || !manifestation.mediaType || !manifestation.carrierType) {
      toast.error("Media type and carrier type are required.");
      return;
    }
    setLoading(true);
    try {
      const created = await createManifestation(expressionId, {
        publisher: manifestation.publisher || undefined,
        placeOfPublication: manifestation.placeOfPublication || undefined,
        dateOfPublication: manifestation.dateOfPublication ? Number(manifestation.dateOfPublication) : undefined,
        editionStatement: manifestation.editionStatement || undefined,
        isbn: manifestation.isbn || undefined,
        mediaType: manifestation.mediaType,
        carrierType: manifestation.carrierType,
      });
      setManifestationId(created.id as number);
      setStep(5);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create manifestation.");
    } finally {
      setLoading(false);
    }
  }

  async function submitStep5() {
    if (!manifestationId || !item.accessionNumber.trim() || !item.barcode.trim() || !item.shelfLocation.trim()) {
      toast.error("Accession number, barcode, and shelf location are required.");
      return;
    }
    setLoading(true);
    try {
      await createItem(manifestationId, {
        accessionNumber: item.accessionNumber.trim(),
        barcode: item.barcode.trim(),
        shelfLocation: item.shelfLocation.trim(),
        conditionNote: item.conditionNote || undefined,
        isDigital: item.isDigital,
        fileUrl: item.isDigital && item.fileUrl ? item.fileUrl.trim() : undefined,
      });
      setStep(6);
      toast.success("Record created successfully.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create item.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (step === 6) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <CheckCircle2 className="w-14 h-14 text-green-500" />
        <div>
          <h2 className="text-xl font-semibold text-stone-800">Record created</h2>
          <p className="text-sm text-stone-400 mt-1">Work ID: <span className="font-mono">{createdWorkId}</span></p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/dashboard/cataloging")}>
            Back to list
          </Button>
          <Button onClick={() => {
            setStep(1);
            setWorkId(null); setExpressionId(null); setManifestationId(null); setCreatedWorkId(null);
            setWork({ title: "", type: "", formOfWork: "", dateOfWork: "", summary: "" });
            setAgents([]); setSubjects([]);
            setClassification({ scheme: "", code: "", description: "" });
            setCallnumber({ scheme: "", classNumber: "", cutter: "", year: "", callNumber: "" });
            setExpression({ language: "English", contentType: "TEXT", formOfExpression: "", extent: "" });
            setManifestation({ publisher: "", placeOfPublication: "", dateOfPublication: "", editionStatement: "", isbn: "", mediaType: "UNMEDIATED", carrierType: "VOLUME" });
            setItem({ accessionNumber: "", barcode: "", shelfLocation: "", conditionNote: "", isDigital: false, fileUrl: "" });
          }}>
            Add another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <StepIndicator current={step} />

      {/* ── Step 1: Work ── */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-stone-800">Work details</h2>
          <div className="space-y-1">
            <Label>Title <span className="text-red-500">*</span></Label>
            <Input value={work.title} onChange={e => setWork(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction to Library Science" />
          </div>
          <div className="space-y-1">
            <Label>Type <span className="text-red-500">*</span></Label>
            <Select value={work.type} onValueChange={v => setWork(p => ({ ...p, type: v as typeof work.type }))}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BOOK">Book</SelectItem>
                <SelectItem value="THESIS">Thesis</SelectItem>
                <SelectItem value="DISSERTATION">Dissertation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Form of work</Label>
              <Input value={work.formOfWork} onChange={e => setWork(p => ({ ...p, formOfWork: e.target.value }))} placeholder="e.g. Novel, Manual" />
            </div>
            <div className="space-y-1">
              <Label>Date of work</Label>
              <Input type="number" value={work.dateOfWork} onChange={e => setWork(p => ({ ...p, dateOfWork: e.target.value }))} placeholder="e.g. 2023" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Summary</Label>
            <Textarea rows={3} value={work.summary} onChange={e => setWork(p => ({ ...p, summary: e.target.value }))} placeholder="Brief description of the work" />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={submitStep1} disabled={loading}>{loading ? "Creating…" : "Next"}</Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Agents, Subjects, Classification, Call Number ── */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-base font-semibold text-stone-800">Agents, subjects &amp; classification</h2>

          {/* Agents */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Agents</Label>
            <div className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="Name"
                value={agentDraft.name}
                onChange={e => setAgentDraft(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && addAgent()}
              />
              <Select value={agentDraft.type} onValueChange={v => setAgentDraft(p => ({ ...p, type: v as AgentEntry["type"] }))}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERSON">Person</SelectItem>
                  <SelectItem value="CORPORATE">Corporate</SelectItem>
                </SelectContent>
              </Select>
              <Select value={agentDraft.role} onValueChange={v => setAgentDraft(p => ({ ...p, role: v as AgentEntry["role"] }))}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTHOR">Author</SelectItem>
                  <SelectItem value="ADVISER">Adviser</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="PUBLISHER">Publisher</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="sm" onClick={addAgent}><Plus className="w-4 h-4" /></Button>
            </div>
            {agents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {agents.map((a, i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-1 bg-stone-100 rounded text-xs text-stone-700">
                    {a.name} · {a.type} · {a.role}
                    <button onClick={() => removeAgent(i)} className="ml-1 text-stone-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Subjects */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Subjects</Label>
            <div className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="Subject term"
                value={subjectDraft}
                onChange={e => setSubjectDraft(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSubject()}
              />
              <Button type="button" variant="outline" size="sm" onClick={addSubject}><Plus className="w-4 h-4" /></Button>
            </div>
            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {subjects.map((s, i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs text-blue-700">
                    {s.term}
                    <button onClick={() => removeSubject(i)} className="ml-1 text-blue-300 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Classification */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Classification <span className="text-stone-400 font-normal">(optional)</span></Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={classification.scheme} onValueChange={v => setClassification(p => ({ ...p, scheme: v as typeof classification.scheme }))}>
                <SelectTrigger><SelectValue placeholder="Scheme" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LCC">LCC</SelectItem>
                  <SelectItem value="DDC">DDC</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Code" value={classification.code} onChange={e => setClassification(p => ({ ...p, code: e.target.value }))} />
              <Input placeholder="Description" value={classification.description} onChange={e => setClassification(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>

          {/* Call Number */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Call number <span className="text-stone-400 font-normal">(optional)</span></Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={callnumber.scheme} onValueChange={v => setCallnumber(p => ({ ...p, scheme: v as typeof callnumber.scheme }))}>
                <SelectTrigger><SelectValue placeholder="Scheme" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LCC">LCC</SelectItem>
                  <SelectItem value="DDC">DDC</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Class number" value={callnumber.classNumber} onChange={e => setCallnumber(p => ({ ...p, classNumber: e.target.value }))} />
              <Input placeholder="Cutter" value={callnumber.cutter} onChange={e => setCallnumber(p => ({ ...p, cutter: e.target.value }))} />
              <Input placeholder="Year" type="number" value={callnumber.year} onChange={e => setCallnumber(p => ({ ...p, year: e.target.value }))} />
            </div>
            <Input placeholder="Full call number (e.g. Z665 .L53 2023)" value={callnumber.callNumber} onChange={e => setCallnumber(p => ({ ...p, callNumber: e.target.value }))} />
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={submitStep2} disabled={loading}>{loading ? "Saving…" : "Next"}</Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Expression ── */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-stone-800">Expression</h2>
          <p className="text-xs text-stone-400">A specific realization of the work in a language or form.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Language <span className="text-red-500">*</span></Label>
              <Input value={expression.language} onChange={e => setExpression(p => ({ ...p, language: e.target.value }))} placeholder="e.g. English" />
            </div>
            <div className="space-y-1">
              <Label>Content type</Label>
              <Select value={expression.contentType} onValueChange={v => setExpression(p => ({ ...p, contentType: v as "TEXT" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Form of expression</Label>
              <Input value={expression.formOfExpression} onChange={e => setExpression(p => ({ ...p, formOfExpression: e.target.value }))} placeholder="e.g. Prose" />
            </div>
            <div className="space-y-1">
              <Label>Extent</Label>
              <Input value={expression.extent} onChange={e => setExpression(p => ({ ...p, extent: e.target.value }))} placeholder="e.g. 320 pages" />
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={submitStep3} disabled={loading}>{loading ? "Saving…" : "Next"}</Button>
          </div>
        </div>
      )}

      {/* ── Step 4: Manifestation ── */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-stone-800">Manifestation</h2>
          <p className="text-xs text-stone-400">The physical or digital embodiment (edition, publication).</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Publisher</Label>
              <Input value={manifestation.publisher} onChange={e => setManifestation(p => ({ ...p, publisher: e.target.value }))} placeholder="e.g. Ateneo Press" />
            </div>
            <div className="space-y-1">
              <Label>Place of publication</Label>
              <Input value={manifestation.placeOfPublication} onChange={e => setManifestation(p => ({ ...p, placeOfPublication: e.target.value }))} placeholder="e.g. Manila" />
            </div>
            <div className="space-y-1">
              <Label>Year of publication</Label>
              <Input type="number" value={manifestation.dateOfPublication} onChange={e => setManifestation(p => ({ ...p, dateOfPublication: e.target.value }))} placeholder="e.g. 2023" />
            </div>
            <div className="space-y-1">
              <Label>Edition</Label>
              <Input value={manifestation.editionStatement} onChange={e => setManifestation(p => ({ ...p, editionStatement: e.target.value }))} placeholder="e.g. 3rd ed." />
            </div>
            <div className="space-y-1">
              <Label>ISBN</Label>
              <Input value={manifestation.isbn} onChange={e => setManifestation(p => ({ ...p, isbn: e.target.value }))} placeholder="e.g. 978-0-00-000000-0" />
            </div>
            <div className="space-y-1">
              <Label>Media type <span className="text-red-500">*</span></Label>
              <Select value={manifestation.mediaType} onValueChange={v => setManifestation(p => ({ ...p, mediaType: v as typeof manifestation.mediaType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNMEDIATED">Unmediated (print)</SelectItem>
                  <SelectItem value="COMPUTER">Computer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Carrier type <span className="text-red-500">*</span></Label>
              <Select value={manifestation.carrierType} onValueChange={v => setManifestation(p => ({ ...p, carrierType: v as typeof manifestation.carrierType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VOLUME">Volume</SelectItem>
                  <SelectItem value="ONLINE_RESOURCE">Online resource</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button onClick={submitStep4} disabled={loading}>{loading ? "Saving…" : "Next"}</Button>
          </div>
        </div>
      )}

      {/* ── Step 5: Item ── */}
      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-stone-800">Item</h2>
          <p className="text-xs text-stone-400">A specific physical or digital copy held by the library.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Accession number <span className="text-red-500">*</span></Label>
              <Input value={item.accessionNumber} onChange={e => setItem(p => ({ ...p, accessionNumber: e.target.value }))} placeholder="e.g. MAIN-2024-00001" />
            </div>
            <div className="space-y-1">
              <Label>Barcode <span className="text-red-500">*</span></Label>
              <Input value={item.barcode} onChange={e => setItem(p => ({ ...p, barcode: e.target.value }))} placeholder="e.g. 0000001" />
            </div>
            <div className="space-y-1">
              <Label>Shelf location <span className="text-red-500">*</span></Label>
              <Input value={item.shelfLocation} onChange={e => setItem(p => ({ ...p, shelfLocation: e.target.value }))} placeholder="e.g. 2F-Ref-A1" />
            </div>
            <div className="space-y-1">
              <Label>Condition note</Label>
              <Input value={item.conditionNote} onChange={e => setItem(p => ({ ...p, conditionNote: e.target.value }))} placeholder="e.g. Good" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDigital"
              checked={item.isDigital}
              onChange={e => setItem(p => ({ ...p, isDigital: e.target.checked }))}
              className="rounded border-stone-300"
            />
            <Label htmlFor="isDigital" className="cursor-pointer">Digital item</Label>
          </div>
          {item.isDigital && (
            <div className="space-y-1">
              <Label>File URL</Label>
              <Input value={item.fileUrl} onChange={e => setItem(p => ({ ...p, fileUrl: e.target.value }))} placeholder="https://..." />
            </div>
          )}
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
            <Button onClick={submitStep5} disabled={loading}>{loading ? "Creating…" : "Finish"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
