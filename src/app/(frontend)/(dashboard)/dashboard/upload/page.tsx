import { Prime, Shadcn } from "@/components";

export default function UploadPage() {
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
                <Prime.SiteHeader />
                <div className="flex flex-1 flex-col">
                    <Prime.UploadSchematicForm />
                </div>
            </Shadcn.SidebarInset>
        </Shadcn.SidebarProvider>
    );
}
