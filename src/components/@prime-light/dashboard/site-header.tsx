import * as React from "react";
import { Shadcn } from "@/components";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-2 px-4 lg:px-6">
                <Shadcn.SidebarTrigger className="shrink-0" />
                <div className="h-4 w-px shrink-0 bg-border" />
                {children ?? (
                    <h1 className="text-base font-medium">创作者仪表盘</h1>
                )}
            </div>
        </header>
    );
}
