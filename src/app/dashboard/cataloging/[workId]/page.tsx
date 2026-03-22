import { notFound } from "next/navigation";
import { getWork } from "@/utils/cataloging";
import WorkDetail from "@/components/Catalog/frbr/WorkDetail";
import { BreadcrumbItemType, DashboardLayout } from "@/components/Dashboardtheme";

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId } = await params;
  const work = await getWork(Number(workId));

  if (!work) notFound();

  const breadcrumbs: BreadcrumbItemType[] = [
    { label: "Catalog", href: "/dashboard" },
    { label: "FRBR Works", href: "/dashboard/cataloging" },
    { label: work.title },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <WorkDetail work={work} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
