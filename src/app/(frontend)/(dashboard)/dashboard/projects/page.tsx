import React from "react";
import { Prime, Shadcn } from "@/components";

export default function ProjectsPage() {
    return (
        <Shadcn.SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }>
            <Prime.AppSidebar variant="inset" />
            <Shadcn.SidebarInset>
                <Prime.SiteHeader
                    breadcrumbs={[
                        { label: "创作者仪表盘", href: "/dashboard" },
                        { label: "项目" },
                    ]}
                />
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-sm text-muted-foreground">暂无项目。</p>
                </div>
            </Shadcn.SidebarInset>
        </Shadcn.SidebarProvider>
    );
}
