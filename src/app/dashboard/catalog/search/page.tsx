import CatalogSearch from "@/components/Catalog/CatalogSearch";
import { BreadcrumbItemType, DashboardLayout } from "@/components/Dashboardtheme";

const breadcrumbs: BreadcrumbItemType[] = [
  { label: "Catalog", href: "/dashboard" },
  { label: "Search" },
];

export default function SearchPage() {
  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <h1 className="text-xl font-bold text-stone-800 mb-1">Catalog Search</h1>
              <p className="text-sm text-stone-400 mb-4">Search books, thesis, and periodical articles by title.</p>
            </div>
            <CatalogSearch />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
