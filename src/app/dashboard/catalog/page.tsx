import { BreadcrumbItemType, DashboardLayout } from "@/components/Dashboardtheme";


const breadcrumbs:BreadcrumbItemType[] = [
    { label: "Catalog ", href: "/dashboard/catalog" },
    { label: "New" }, // current page, no link
]

export default function CatalogPage(){

    return(
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <h1>Catalog</h1>
            <p>Welcome to the Catalog page!</p>
        </DashboardLayout>
    )
}