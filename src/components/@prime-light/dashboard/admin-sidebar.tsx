"use client";

import { DashboardSidebar, type DashboardSidebarProps } from "./dashboard-sidebar";

export type AdminSidebarProps = Omit<DashboardSidebarProps, "title" | "homeHref">;

export function AdminSidebar(props: AdminSidebarProps) {
    return <DashboardSidebar title="管理员面板" homeHref="/admin" {...props} />;
}
