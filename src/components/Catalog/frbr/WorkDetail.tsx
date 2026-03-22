"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, User, Tag, Hash, Layers, Pencil } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Agent = { id: number; name: string; type: string; birthYear?: number; deathYear?: number };
type WorkAgent = { agentId: number; role: string; agent: Agent };
type Subject = { id: number; term: string };
type WorkSubject = { subjectId: number; subject: Subject };
type Classification = { id: number; scheme: string; code: string; description?: string };
type WorkClassification = { classificationId: number; classification: Classification };
type Callnumber = { id: number; scheme: string; classNumber: string; cutter?: string; year?: number; callNumber: string };
type Item = { id: number; accessionNumber: string; barcode: string; shelfLocation: string; conditionNote?: string; isDigital: boolean; fileUrl?: string };
type Manifestation = { id: number; publisher?: string; placeOfPublication?: string; dateOfPublication?: number; editionStatement?: string; isbn?: string; mediaType: string; carrierType: string; items: Item[] };
type Expression = { id: number; language: string; contentType: string; formOfExpression?: string; extent?: string; manifestations: Manifestation[] };

export type Work = {
  id: number;
  title: string;
  type: "BOOK" | "THESIS" | "DISSERTATION";
  formOfWork?: string;
  summary?: string;
  dateOfWork?: number;
  createdAt: string;
  updatedAt: string;
  work_agents: WorkAgent[];
  work_subjects: WorkSubject[];
  work_classifications: WorkClassification[];
  call_numbers: Callnumber[];
  expressions: Expression[];
};

// ─── Badge helpers ────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<string, string> = {
  BOOK: "bg-blue-100 text-blue-700",
  THESIS: "bg-purple-100 text-purple-700",
  DISSERTATION: "bg-amber-100 text-amber-700",
};

const ROLE_BADGE: Record<string, string> = {
  AUTHOR: "bg-stone-100 text-stone-700",
  ADVISER: "bg-teal-100 text-teal-700",
  EDITOR: "bg-indigo-100 text-indigo-700",
  PUBLISHER: "bg-pink-100 text-pink-700",
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-stone-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-stone-50 border-b border-stone-200">
        <span className="text-stone-500 w-4 h-4">{icon}</span>
        <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WorkDetail({ work }: { work: Work }) {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-4 space-y-5">

      {/* Back */}
      <button
        onClick={() => router.push("/dashboard/cataloging")}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to works
      </button>

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-stone-900 leading-tight">{work.title}</h1>
          <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/cataloging/${work.id}/edit`)} className="shrink-0 gap-1.5">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_BADGE[work.type] ?? "bg-stone-100 text-stone-600"}`}>
            {work.type}
          </span>
          {work.dateOfWork && <span>· {work.dateOfWork}</span>}
          {work.formOfWork && <span>· {work.formOfWork}</span>}
          <span className="text-stone-300">·</span>
          <span className="text-xs text-stone-400">ID {work.id}</span>
        </div>
        {work.summary && (
          <p className="text-sm text-stone-600 pt-1 max-w-2xl">{work.summary}</p>
        )}
      </div>

      {/* Agents */}
      {work.work_agents.length > 0 && (
        <Section icon={<User className="w-4 h-4" />} title="Agents">
          <div className="space-y-2">
            {work.work_agents.map((wa, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${ROLE_BADGE[wa.role] ?? "bg-stone-100 text-stone-600"}`}>
                  {wa.role}
                </span>
                <span className="text-sm font-medium text-stone-800">{wa.agent.name}</span>
                <span className="text-xs text-stone-400">{wa.agent.type}</span>
                {(wa.agent.birthYear || wa.agent.deathYear) && (
                  <span className="text-xs text-stone-400">
                    ({wa.agent.birthYear ?? "?"}–{wa.agent.deathYear ?? ""})
                  </span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Subjects */}
      {work.work_subjects.length > 0 && (
        <Section icon={<Tag className="w-4 h-4" />} title="Subjects">
          <div className="flex flex-wrap gap-2">
            {work.work_subjects.map((ws, i) => (
              <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                {ws.subject.term}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Classifications & Call Numbers — side by side */}
      {(work.work_classifications.length > 0 || work.call_numbers.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {work.work_classifications.length > 0 && (
            <Section icon={<Hash className="w-4 h-4" />} title="Classifications">
              <div className="space-y-1.5">
                {work.work_classifications.map((wc, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded mr-2">{wc.classification.scheme}</span>
                    <span className="font-medium">{wc.classification.code}</span>
                    {wc.classification.description && (
                      <span className="text-stone-400 ml-2">— {wc.classification.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {work.call_numbers.length > 0 && (
            <Section icon={<BookOpen className="w-4 h-4" />} title="Call Numbers">
              <div className="space-y-1.5">
                {work.call_numbers.map((cn, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-mono text-stone-800 font-semibold">{cn.callNumber}</span>
                    <span className="text-xs text-stone-400 ml-2">({cn.scheme})</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {/* FRBR hierarchy: Expressions → Manifestations → Items */}
      <Section icon={<Layers className="w-4 h-4" />} title="Expressions · Manifestations · Items">
        {work.expressions.length === 0 ? (
          <p className="text-sm text-stone-400">No expressions recorded.</p>
        ) : (
          <div className="space-y-4">
            {work.expressions.map((expr, ei) => (
              <div key={expr.id} className="rounded-lg border border-stone-200 overflow-hidden">
                {/* Expression header */}
                <div className="flex items-center gap-3 px-4 py-2.5 bg-stone-50">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Expression</span>
                  <span className="text-sm font-medium text-stone-800">{expr.language}</span>
                  <span className="text-xs text-stone-400">{expr.contentType}</span>
                  {expr.formOfExpression && <span className="text-xs text-stone-400">· {expr.formOfExpression}</span>}
                  {expr.extent && <span className="text-xs text-stone-400">· {expr.extent}</span>}
                  <span className="ml-auto text-xs font-mono text-stone-300">#{expr.id}</span>
                </div>

                {/* Manifestations */}
                {expr.manifestations.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-stone-400">No manifestations.</p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {expr.manifestations.map((mani, mi) => (
                      <div key={mani.id} className="px-4 py-3 space-y-2">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Manifestation</span>
                          {mani.publisher && <span className="text-sm text-stone-700">{mani.publisher}</span>}
                          {mani.placeOfPublication && <span className="text-xs text-stone-400">{mani.placeOfPublication}</span>}
                          {mani.dateOfPublication && <span className="text-xs text-stone-400">{mani.dateOfPublication}</span>}
                          {mani.editionStatement && <span className="text-xs text-stone-500">{mani.editionStatement}</span>}
                          {mani.isbn && <span className="text-xs font-mono text-stone-400">ISBN {mani.isbn}</span>}
                          <span className="text-xs text-stone-300">{mani.mediaType} / {mani.carrierType}</span>
                          <span className="ml-auto text-xs font-mono text-stone-300">#{mani.id}</span>
                        </div>

                        {/* Items */}
                        {mani.items && mani.items.length > 0 && (
                          <div className="ml-4 space-y-1">
                            <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-x-4 text-[11px] font-semibold text-stone-400 uppercase tracking-wide px-2 py-1">
                              <span>#</span><span>Accession</span><span>Barcode</span><span>Location</span><span>Condition</span>
                            </div>
                            {mani.items.map((item, ii) => (
                              <div
                                key={item.id}
                                className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-x-4 text-xs px-2 py-1.5 rounded bg-stone-50 items-center"
                              >
                                <span className="font-mono text-stone-300">{ii + 1}</span>
                                <span className="font-mono text-stone-700">{item.accessionNumber}</span>
                                <span className="font-mono text-stone-500">{item.barcode}</span>
                                <span className="text-stone-600">{item.shelfLocation}</span>
                                <span className="text-stone-400">{item.conditionNote ?? "—"}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Metadata footer */}
      <div className="text-xs text-stone-300 flex gap-4 pt-1">
        <span>Created {work.createdAt ? new Date(work.createdAt).toLocaleString("en-PH") : "—"}</span>
        <span>Updated {work.updatedAt ? new Date(work.updatedAt).toLocaleString("en-PH") : "—"}</span>
      </div>
    </div>
  );
}
