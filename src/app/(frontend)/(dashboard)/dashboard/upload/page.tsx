import type { CSSProperties } from "react";
import { Prime, Shadcn } from "@/components";

export default function UploadPage() {
    return (
        <Shadcn.SidebarProvider
            className="h-svh! min-h-0! overflow-hidden"
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as CSSProperties
            }>
            <Prime.AppSidebar variant="inset" />
            <Shadcn.SidebarInset className="overflow-hidden">
                <Prime.SiteHeader
                    breadcrumbs={[
                        { label: "创作者仪表盘", href: "/dashboard" },
                        { label: "上传原理图" },
                    ]}
                />
                <div className="flex flex-1 flex-col overflow-y-auto">
                    <Prime.UploadSchematicForm />
                </div>
            </Shadcn.SidebarInset>
        </Shadcn.SidebarProvider>
    );
}
