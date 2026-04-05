import { Prime, Shadcn } from "@/components";

import data from "./data.json";

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
                <Prime.SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <Prime.SectionCards />
                            <div className="px-4 lg:px-6">
                                <Prime.ChartAreaInteractive />
                            </div>
                            <Prime.DataTable data={data} />
                        </div>
                    </div>
                </div>
            </Shadcn.SidebarInset>
        </Shadcn.SidebarProvider>
    );
}
