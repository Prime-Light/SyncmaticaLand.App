"use client";

import { DashboardSidebar, type DashboardSidebarProps } from "./dashboard-sidebar";

export type AppSidebarProps = Omit<DashboardSidebarProps, "title" | "homeHref">;

export function AppSidebar(props: AppSidebarProps) {
    return <DashboardSidebar title="创作者仪表盘" homeHref="/dashboard" {...props} />;
}
