import { notFound } from "next/navigation";
import { getWork } from "@/utils/cataloging";
import EditWorkForm from "@/components/Catalog/frbr/EditWorkForm";

export default async function EditWorkPage({ params }: { params: Promise<{ workId: string }> }) {
  const { workId } = await params;
  const work = await getWork(Number(workId)).catch(() => null);
  if (!work) notFound();
  return <EditWorkForm work={work} />;
}
