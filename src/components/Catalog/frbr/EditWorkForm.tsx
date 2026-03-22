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
import { X, Plus, ArrowLeft, Save, Loader2 } from "lucide-react";
import {
  updateWork,
  createAgent, addWorkAgent, removeWorkAgent,
  createSubject, addWorkSubject, removeWorkSubject,
  createClassification, addWorkClassification, removeWorkClassification,
  createCallnumber, deleteCallnumber,
} from "@/utils/cataloging";
import type { Work } from "@/components/Catalog/frbr/WorkDetail";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-stone-200 overflow-hidden">
      <div className="px-4 py-3 bg-stone-50 border-b border-stone-200">
        <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

// ─── Saving indicator ─────────────────────────────────────────────────────────

function SaveButton({ loading, onClick, label = "Save" }: { loading: boolean; onClick: () => void; label?: string }) {
  return (
    <Button size="sm" onClick={onClick} disabled={loading} className="gap-1.5">
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
      {loading ? "Saving…" : label}
    </Button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EditWorkForm({ work }: { work: Work }) {
  const router = useRouter();

  // ── Work details ────────────────────────────────────────────────────────────
  const [details, setDetails] = useState({
    title: work.title,
    type: work.type as string,
    formOfWork: work.formOfWork ?? "",
    dateOfWork: work.dateOfWork ? String(work.dateOfWork) : "",
    summary: work.summary ?? "",
  });
  const [savingDetails, setSavingDetails] = useState(false);

  async function handleSaveDetails() {
    if (!details.title.trim() || !details.type) {
      toast.error("Title and type are required.");
      return;
    }
    setSavingDetails(true);
    try {
      await updateWork(work.id, {
        title: details.title.trim(),
        type: details.type,
        formOfWork: details.formOfWork || undefined,
        summary: details.summary || undefined,
        dateOfWork: details.dateOfWork ? Number(details.dateOfWork) : null,
      });
      toast.success("Work details saved.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSavingDetails(false);
    }
  }

  // ── Agents ──────────────────────────────────────────────────────────────────
  type AgentRow = { agentId: number; role: string; agent: { name: string; type: string } };
  const [agents, setAgents] = useState<AgentRow[]>(work.work_agents);
  const [agentDraft, setAgentDraft] = useState({ name: "", type: "PERSON", role: "AUTHOR" });
  const [savingAgent, setSavingAgent] = useState(false);

  async function handleAddAgent() {
    if (!agentDraft.name.trim()) return;
    setSavingAgent(true);
    try {
      const agent = await createAgent({ name: agentDraft.name.trim(), type: agentDraft.type });
      await addWorkAgent(work.id, agent.id as number, agentDraft.role);
      setAgents(prev => [...prev, { agentId: agent.id as number, role: agentDraft.role, agent: { name: agentDraft.name.trim(), type: agentDraft.type } }]);
      setAgentDraft({ name: "", type: "PERSON", role: "AUTHOR" });
      toast.success("Agent added.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add agent.");
    } finally {
      setSavingAgent(false);
    }
  }

  async function handleRemoveAgent(agentId: number, role: string) {
    try {
      await removeWorkAgent(work.id, agentId, role);
      setAgents(prev => prev.filter(a => !(a.agentId === agentId && a.role === role)));
      toast.success("Agent removed.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to remove agent.");
    }
  }

  // ── Subjects ────────────────────────────────────────────────────────────────
  type SubjectRow = { subjectId: number; subject: { term: string } };
  const [subjects, setSubjects] = useState<SubjectRow[]>(work.work_subjects);
  const [subjectDraft, setSubjectDraft] = useState("");
  const [savingSubject, setSavingSubject] = useState(false);

  async function handleAddSubject() {
    if (!subjectDraft.trim()) return;
    setSavingSubject(true);
    try {
      const subject = await createSubject(subjectDraft.trim());
      await addWorkSubject(work.id, subject.id as number);
      setSubjects(prev => [...prev, { subjectId: subject.id as number, subject: { term: subjectDraft.trim() } }]);
      setSubjectDraft("");
      toast.success("Subject added.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add subject.");
    } finally {
      setSavingSubject(false);
    }
  }

  async function handleRemoveSubject(subjectId: number) {
    try {
      await removeWorkSubject(work.id, subjectId);
      setSubjects(prev => prev.filter(s => s.subjectId !== subjectId));
      toast.success("Subject removed.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to remove subject.");
    }
  }

  // ── Classifications ─────────────────────────────────────────────────────────
  type ClassRow = { classificationId: number; classification: { scheme: string; code: string; description?: string } };
  const [classifications, setClassifications] = useState<ClassRow[]>(work.work_classifications);
  const [classDraft, setClassDraft] = useState({ scheme: "", code: "", description: "" });
  const [savingClass, setSavingClass] = useState(false);

  async function handleAddClass() {
    if (!classDraft.scheme || !classDraft.code.trim()) return;
    setSavingClass(true);
    try {
      const cls = await createClassification({ scheme: classDraft.scheme, code: classDraft.code.trim(), description: classDraft.description || undefined });
      await addWorkClassification(work.id, cls.id as number);
      setClassifications(prev => [...prev, { classificationId: cls.id as number, classification: { scheme: classDraft.scheme, code: classDraft.code.trim(), description: classDraft.description || undefined } }]);
      setClassDraft({ scheme: "", code: "", description: "" });
      toast.success("Classification added.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add classification.");
    } finally {
      setSavingClass(false);
    }
  }

  async function handleRemoveClass(classificationId: number) {
    try {
      await removeWorkClassification(work.id, classificationId);
      setClassifications(prev => prev.filter(c => c.classificationId !== classificationId));
      toast.success("Classification removed.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to remove.");
    }
  }

  // ── Call Numbers ────────────────────────────────────────────────────────────
  type CallnumberRow = { id: number; scheme: string; classNumber: string; cutter?: string; year?: number; callNumber: string };
  const [callnumbers, setCallnumbers] = useState<CallnumberRow[]>(work.call_numbers);
  const [cnDraft, setCnDraft] = useState({ scheme: "", classNumber: "", cutter: "", year: "", callNumber: "" });
  const [savingCn, setSavingCn] = useState(false);

  async function handleAddCallnumber() {
    if (!cnDraft.scheme || !cnDraft.classNumber.trim() || !cnDraft.callNumber.trim()) return;
    setSavingCn(true);
    try {
      const cn = await createCallnumber(work.id, {
        scheme: cnDraft.scheme,
        classNumber: cnDraft.classNumber.trim(),
        cutter: cnDraft.cutter || undefined,
        year: cnDraft.year ? Number(cnDraft.year) : undefined,
        callNumber: cnDraft.callNumber.trim(),
      });
      setCallnumbers(prev => [...prev, { id: cn.id as number, scheme: cnDraft.scheme, classNumber: cnDraft.classNumber, cutter: cnDraft.cutter || undefined, year: cnDraft.year ? Number(cnDraft.year) : undefined, callNumber: cnDraft.callNumber }]);
      setCnDraft({ scheme: "", classNumber: "", cutter: "", year: "", callNumber: "" });
      toast.success("Call number added.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add call number.");
    } finally {
      setSavingCn(false);
    }
  }

  async function handleDeleteCallnumber(id: number) {
    try {
      await deleteCallnumber(id);
      setCallnumbers(prev => prev.filter(cn => cn.id !== id));
      toast.success("Call number removed.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to remove.");
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-6 py-4 space-y-5">

      {/* Back */}
      <button
        onClick={() => router.push(`/dashboard/cataloging/${work.id}`)}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to record
      </button>

      <div>
        <h1 className="text-xl font-bold text-stone-900">Edit record</h1>
        <p className="text-sm text-stone-400">Work ID {work.id}</p>
      </div>

      {/* ── Work details ── */}
      <Section title="Work details">
        <div className="space-y-1">
          <Label>Title <span className="text-red-500">*</span></Label>
          <Input value={details.title} onChange={e => setDetails(p => ({ ...p, title: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Type <span className="text-red-500">*</span></Label>
            <Select value={details.type} onValueChange={v => setDetails(p => ({ ...p, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BOOK">Book</SelectItem>
                <SelectItem value="THESIS">Thesis</SelectItem>
                <SelectItem value="DISSERTATION">Dissertation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Form of work</Label>
            <Input value={details.formOfWork} onChange={e => setDetails(p => ({ ...p, formOfWork: e.target.value }))} placeholder="e.g. Novel, Manual" />
          </div>
          <div className="space-y-1">
            <Label>Date of work</Label>
            <Input type="number" value={details.dateOfWork} onChange={e => setDetails(p => ({ ...p, dateOfWork: e.target.value }))} placeholder="e.g. 2023" />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Summary</Label>
          <Textarea rows={3} value={details.summary} onChange={e => setDetails(p => ({ ...p, summary: e.target.value }))} />
        </div>
        <div className="flex justify-end">
          <SaveButton loading={savingDetails} onClick={handleSaveDetails} />
        </div>
      </Section>

      {/* ── Agents ── */}
      <Section title="Agents">
        {agents.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {agents.map((a, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-md bg-stone-50 text-sm">
                <span className="font-medium text-stone-800 flex-1">{a.agent.name}</span>
                <span className="text-xs text-stone-400">{a.agent.type}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-stone-200 text-stone-600">{a.role}</span>
                <button onClick={() => handleRemoveAgent(a.agentId, a.role)} className="text-stone-300 hover:text-red-500 transition-colors ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            className="flex-1"
            placeholder="Agent name"
            value={agentDraft.name}
            onChange={e => setAgentDraft(p => ({ ...p, name: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleAddAgent()}
          />
          <Select value={agentDraft.type} onValueChange={v => setAgentDraft(p => ({ ...p, type: v }))}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PERSON">Person</SelectItem>
              <SelectItem value="CORPORATE">Corporate</SelectItem>
            </SelectContent>
          </Select>
          <Select value={agentDraft.role} onValueChange={v => setAgentDraft(p => ({ ...p, role: v }))}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="AUTHOR">Author</SelectItem>
              <SelectItem value="ADVISER">Adviser</SelectItem>
              <SelectItem value="EDITOR">Editor</SelectItem>
              <SelectItem value="PUBLISHER">Publisher</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleAddAgent} disabled={savingAgent} className="shrink-0">
            {savingAgent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </Section>

      {/* ── Subjects ── */}
      <Section title="Subjects">
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {subjects.map((s, i) => (
              <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                {s.subject.term}
                <button onClick={() => handleRemoveSubject(s.subjectId)} className="ml-1 text-blue-300 hover:text-red-500 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            className="flex-1"
            placeholder="Subject term"
            value={subjectDraft}
            onChange={e => setSubjectDraft(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddSubject()}
          />
          <Button variant="outline" size="sm" onClick={handleAddSubject} disabled={savingSubject} className="shrink-0">
            {savingSubject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </Section>

      {/* ── Classifications ── */}
      <Section title="Classifications">
        {classifications.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {classifications.map((c, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-md bg-stone-50 text-sm">
                <span className="font-mono text-xs bg-stone-200 px-1.5 py-0.5 rounded">{c.classification.scheme}</span>
                <span className="font-medium text-stone-800 flex-1">{c.classification.code}</span>
                {c.classification.description && <span className="text-xs text-stone-400">{c.classification.description}</span>}
                <button onClick={() => handleRemoveClass(c.classificationId)} className="text-stone-300 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          <Select value={classDraft.scheme} onValueChange={v => setClassDraft(p => ({ ...p, scheme: v }))}>
            <SelectTrigger><SelectValue placeholder="Scheme" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LCC">LCC</SelectItem>
              <SelectItem value="DDC">DDC</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Code" value={classDraft.code} onChange={e => setClassDraft(p => ({ ...p, code: e.target.value }))} />
          <Input placeholder="Description" value={classDraft.description} onChange={e => setClassDraft(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleAddClass} disabled={savingClass} className="gap-1.5">
            {savingClass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add
          </Button>
        </div>
      </Section>

      {/* ── Call Numbers ── */}
      <Section title="Call numbers">
        {callnumbers.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {callnumbers.map(cn => (
              <div key={cn.id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-stone-50 text-sm">
                <span className="font-mono font-semibold text-stone-800 flex-1">{cn.callNumber}</span>
                <span className="text-xs text-stone-400">({cn.scheme})</span>
                <button onClick={() => handleDeleteCallnumber(cn.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Select value={cnDraft.scheme} onValueChange={v => setCnDraft(p => ({ ...p, scheme: v }))}>
            <SelectTrigger><SelectValue placeholder="Scheme" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LCC">LCC</SelectItem>
              <SelectItem value="DDC">DDC</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Class number" value={cnDraft.classNumber} onChange={e => setCnDraft(p => ({ ...p, classNumber: e.target.value }))} />
          <Input placeholder="Cutter" value={cnDraft.cutter} onChange={e => setCnDraft(p => ({ ...p, cutter: e.target.value }))} />
          <Input placeholder="Year" type="number" value={cnDraft.year} onChange={e => setCnDraft(p => ({ ...p, year: e.target.value }))} />
        </div>
        <Input placeholder="Full call number (e.g. Z665 .L53 2023)" value={cnDraft.callNumber} onChange={e => setCnDraft(p => ({ ...p, callNumber: e.target.value }))} />
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleAddCallnumber} disabled={savingCn} className="gap-1.5">
            {savingCn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add
          </Button>
        </div>
      </Section>

    </div>
  );
}
