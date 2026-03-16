"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import React from "react"

export interface BreadcrumbItemType {
  label: string
  href?: string // if href is present, render BreadcrumbLink; otherwise BreadcrumbPage
}

interface PatronLayoutProps {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbItemType[]
}

export function DashboardLayout({ children, breadcrumbs = [] }: PatronLayoutProps) {
  return (
    <SidebarProvider
    style={
      {
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties
    }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={index}>
                    {item.href ? (
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                      </BreadcrumbItem>
                    ) : (
                      <BreadcrumbItem>
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      </BreadcrumbItem>
                    )}
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}