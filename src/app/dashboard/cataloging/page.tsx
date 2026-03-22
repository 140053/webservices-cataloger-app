import WorksList from "@/components/Catalog/frbr/WorksList";
import { BreadcrumbItemType, DashboardLayout } from "@/components/Dashboardtheme";

const breadcrumbs: BreadcrumbItemType[] = [
  { label: "Catalog", href: "/dashboard" },
  { label: "FRBR Works" },
];

export default function CatalogingPage() {
  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <WorksList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
