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
                <Prime.SiteHeader>
                    <Shadcn.Breadcrumb>
                        <Shadcn.BreadcrumbList>
                            <Shadcn.BreadcrumbItem>
                                <Shadcn.BreadcrumbLink
                                    href="/dashboard"
                                    className="text-muted-foreground">
                                    创作者仪表盘
                                </Shadcn.BreadcrumbLink>
                            </Shadcn.BreadcrumbItem>
                            <Shadcn.BreadcrumbSeparator />
                            <Shadcn.BreadcrumbItem>
                                <Shadcn.BreadcrumbPage>上传原理图</Shadcn.BreadcrumbPage>
                            </Shadcn.BreadcrumbItem>
                        </Shadcn.BreadcrumbList>
                    </Shadcn.Breadcrumb>
                </Prime.SiteHeader>
                <div className="flex flex-1 flex-col">
                    <Prime.UploadSchematicForm />
                </div>
            </Shadcn.SidebarInset>
        </Shadcn.SidebarProvider>
    );
}
