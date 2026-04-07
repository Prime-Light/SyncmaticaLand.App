import { Prime, Shadcn } from "@/components";

export default function Page() {
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
                <Prime.SiteHeader breadcrumbs={[{ label: "创作者仪表盘" }]} />
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-sm text-muted-foreground">仪表盘制作中…</p>
                </div>
            </Shadcn.SidebarInset>
        </Shadcn.SidebarProvider>
    );
}
