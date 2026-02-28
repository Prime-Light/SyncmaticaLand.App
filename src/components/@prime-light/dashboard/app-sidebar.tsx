"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ChartBarIcon, FolderIcon, HouseIcon, LayoutDashboardIcon, Settings2Icon, Stone } from "lucide-react";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/@radix-ui/sidebar";

interface DashboardUser {
    $id: string;
    name: string;
    email: string;
    emailVerification: boolean;
}

export function AppSidebar({
    user,
    ...props
}: React.ComponentProps<typeof Sidebar> & {
    user: DashboardUser | null;
}) {
    const t = useTranslations("Pages.Dashboard.Sidebar");

    const sidebarUser = user
        ? {
              name: user.name,
              email: user.email,
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
          }
        : {
              name: t("UserMenu.GuestUser") || "Guest",
              email: t("UserMenu.GuestEmail") || "Not logged in",
              avatar: "",
          };

    const navMain = [
        { title: t("NavMain.Dashboard"), url: "#", icon: <LayoutDashboardIcon /> },
        { title: t("NavMain.Analytics"), url: "#", icon: <ChartBarIcon /> },
        { title: t("NavMain.Projects"), url: "#", icon: <FolderIcon /> },
    ];

    const navSecondary = [
        { title: t("Secondary.BackToHome"), url: "/", icon: <HouseIcon /> },
        { title: t("Secondary.Settings"), url: "#", icon: <Settings2Icon /> },
    ];

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
                            <a href="#">
                                <Stone className="size-5!" />
                                <span className="text-base font-semibold">{t("CreatorPanel")}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={sidebarUser} />
            </SidebarFooter>
        </Sidebar>
    );
}
