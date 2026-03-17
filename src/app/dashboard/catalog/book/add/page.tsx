import { ChartAreaInteractive } from "@/components/Catalog/Chart-Area-interactive";
import BookCatalogForm from "@/components/Catalog/form-add-book";
import { SectionCards } from "@/components/Catalog/Section-Card";
import { BreadcrumbItemType, DashboardLayout } from "@/components/Dashboardtheme";


const breadcrumbs:BreadcrumbItemType[] = [
    { label: "Catalog ", href: "/dashboard" },
    { label: "Add book ",  },
   
]


export default function Dashboard(){

    return(
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              <BookCatalogForm />
             
            </div>
          </div>
        </div>
        </DashboardLayout>
    )
}