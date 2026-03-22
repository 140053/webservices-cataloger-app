"use server";

import { cookies } from "next/headers";

async function getToken() {
  const token = (await cookies()).get("token")?.value;
  if (!token) throw new Error("No auth token");
  return token;
}

async function apiGet(path: string) {
  const token = await getToken();
  const res = await fetch(`${process.env.NODE_ENV_BACKEND_API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "API error");
  return data;
}

async function apiPut(path: string, body: unknown = {}) {
  const token = await getToken();
  const res = await fetch(`${process.env.NODE_ENV_BACKEND_API}${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try { data = JSON.parse(text); } catch { /* non-JSON */ }
  if (!res.ok) throw new Error((data.detail as string) || `API error ${res.status}`);
  return data;
}

async function apiDelete(path: string) {
  const token = await getToken();
  const res = await fetch(`${process.env.NODE_ENV_BACKEND_API}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    let data: Record<string, unknown> = {};
    try { data = JSON.parse(text); } catch { /* non-JSON */ }
    throw new Error((data.detail as string) || `API error ${res.status}`);
  }
  return true;
}

async function apiPost(path: string, body: unknown = {}) {
  const token = await getToken();
  const res = await fetch(`${process.env.NODE_ENV_BACKEND_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try { data = JSON.parse(text); } catch { /* non-JSON body (e.g. 500 HTML) */ }
  if (!res.ok) throw new Error((data.detail as string) || `API error ${res.status}`);
  return data;
}

// ─── Works ────────────────────────────────────────────────────────────────────

export async function getWorks(q?: string, type?: string, limit = 50) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (q) params.set("q", q);
  if (type) params.set("type", type);
  return apiGet(`/cataloging/works?${params}`);
}

export async function getWork(workId: number) {
  return apiGet(`/cataloging/works/${workId}`);
}

export async function updateWork(workId: number, data: {
  title?: string;
  type?: string;
  formOfWork?: string;
  summary?: string;
  dateOfWork?: number | null;
}) {
  return apiPut(`/cataloging/works/${workId}`, data);
}

export async function createWork(data: {
  title: string;
  type: string;
  formOfWork?: string;
  summary?: string;
  dateOfWork?: number;
}) {
  return apiPost("/cataloging/works", data);
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export async function createAgent(data: {
  name: string;
  type: string;
  birthYear?: number;
  deathYear?: number;
}) {
  return apiPost("/cataloging/agents", data);
}

export async function addWorkAgent(workId: number, agentId: number, role: string) {
  return apiPost(`/cataloging/works/${workId}/agents`, { agentId, role });
}

export async function removeWorkAgent(workId: number, agentId: number, role: string) {
  return apiDelete(`/cataloging/works/${workId}/agents/${agentId}/${role}`);
}

// ─── Subjects ─────────────────────────────────────────────────────────────────

export async function createSubject(term: string) {
  return apiPost("/cataloging/subjects", { term });
}

export async function addWorkSubject(workId: number, subjectId: number) {
  return apiPost(`/cataloging/works/${workId}/subjects/${subjectId}`);
}

export async function removeWorkSubject(workId: number, subjectId: number) {
  return apiDelete(`/cataloging/works/${workId}/subjects/${subjectId}`);
}

// ─── Classifications ──────────────────────────────────────────────────────────

export async function createClassification(data: {
  scheme: string;
  code: string;
  description?: string;
}) {
  return apiPost("/cataloging/classifications", data);
}

export async function addWorkClassification(workId: number, classificationId: number) {
  return apiPost(`/cataloging/works/${workId}/classifications/${classificationId}`);
}

export async function removeWorkClassification(workId: number, classificationId: number) {
  return apiDelete(`/cataloging/works/${workId}/classifications/${classificationId}`);
}

// ─── Call Numbers ─────────────────────────────────────────────────────────────

export async function createCallnumber(
  workId: number,
  data: {
    scheme: string;
    classNumber: string;
    cutter?: string;
    year?: number;
    callNumber: string;
    itemId?: number;
  }
) {
  return apiPost(`/cataloging/works/${workId}/callnumbers`, data);
}

export async function deleteCallnumber(callnumberId: number) {
  return apiDelete(`/cataloging/callnumbers/${callnumberId}`);
}

// ─── Expressions ──────────────────────────────────────────────────────────────

export async function createExpression(
  workId: number,
  data: {
    language: string;
    contentType: string;
    formOfExpression?: string;
    extent?: string;
  }
) {
  return apiPost(`/cataloging/works/${workId}/expressions`, data);
}

// ─── Manifestations ───────────────────────────────────────────────────────────

export async function createManifestation(
  expressionId: number,
  data: {
    publisher?: string;
    placeOfPublication?: string;
    dateOfPublication?: number;
    editionStatement?: string;
    isbn?: string;
    mediaType: string;
    carrierType: string;
  }
) {
  return apiPost(`/cataloging/expressions/${expressionId}/manifestations`, data);
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function createItem(
  manifestationId: number,
  data: {
    accessionNumber: string;
    barcode: string;
    shelfLocation: string;
    conditionNote?: string;
    isDigital?: boolean;
    fileUrl?: string;
  }
) {
  return apiPost(`/cataloging/manifestations/${manifestationId}/items`, data);
}
