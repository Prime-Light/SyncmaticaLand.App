import { AppSidebar } from "@/components/@prime-light/dashboard/app-sidebar";
import { ChartAreaInteractive } from "@/components/@prime-light/dashboard/chart-area-interactive";
import { DataTable } from "@/components/@prime-light/dashboard/data-table";
import { SectionCards } from "@/components/@prime-light/dashboard/section-cards";
import { SiteHeader } from "@/components/@prime-light/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/@radix-ui/sidebar";
import { getCurrentUser } from "@/lib/auth/session";

import data from "./data.json";

export default async function Page() {
    const user = await getCurrentUser();

    // 将 Appwrite User 对象转换为普通对象，以便传递给客户端组件
    const plainUser = user
        ? {
              $id: user.$id,
              name: user.name,
              email: user.email,
              emailVerification: user.emailVerification,
          }
        : null;

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }>
            <AppSidebar variant="inset" user={plainUser} />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <SectionCards />
                            <div className="px-4 lg:px-6">
                                <ChartAreaInteractive />
                            </div>
                            <DataTable data={data} />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
