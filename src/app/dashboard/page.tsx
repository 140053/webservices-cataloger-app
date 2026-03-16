import { ChartAreaInteractive } from "@/components/Catalog/Chart-Area-interactive";
import { SectionCards } from "@/components/Catalog/Section-Card";
import { BreadcrumbItemType, DashboardLayout } from "@/components/Dashboardtheme";
import { DataTable } from "@/components/contain-data-table"

const breadcrumbs:BreadcrumbItemType[] = [
    { label: "Cataloger Dashboard ", href: "/dashboard" },
   
]
import data from "./data.json"


export default function Dashboard(){

    return(
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
             
            </div>
          </div>
        </div>
        </DashboardLayout>
    )
}