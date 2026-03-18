import ThesisCatalogForm from "@/components/Catalog/form-add-thesis";
import { BreadcrumbItemType, DashboardLayout } from "@/components/Dashboardtheme";


const breadcrumbs:BreadcrumbItemType[] = [
    { label: "Catalog ", href: "/dashboard" },
    { label: "Add Thesis ",  },
   
]


export default function Dashboard(){

    return(
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              <ThesisCatalogForm />
             
            </div>
          </div>
        </div>
        </DashboardLayout>
    )
}