import NewWorkWizard from "@/components/Catalog/frbr/NewWorkWizard";
import { BreadcrumbItemType, DashboardLayout } from "@/components/Dashboardtheme";

const breadcrumbs: BreadcrumbItemType[] = [
  { label: "Catalog", href: "/dashboard" },
  { label: "FRBR Works", href: "/dashboard/cataloging" },
  { label: "New record" },
];

export default function NewCatalogingPage() {
  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <NewWorkWizard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
