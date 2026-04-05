"use client";

import * as React from "react";

import { Shadcn, Prime } from "@/components";
import {
    LayoutDashboardIcon,
    FolderIcon,
    StoneIcon,
} from "lucide-react";

const data = {
    navMain: [
        {
            title: "仪表盘",
            url: "#",
            icon: <LayoutDashboardIcon />,
        },
        {
            title: "项目",
            url: "#",
            icon: <FolderIcon />,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Shadcn.Sidebar>) {
    return (
        <Shadcn.Sidebar collapsible="offcanvas" {...props}>
            <Shadcn.SidebarHeader>
                <Shadcn.SidebarMenu>
                    <Shadcn.SidebarMenuItem>
                        <Shadcn.SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:p-1.5!">
                            <a href="#">
                                <StoneIcon className="size-5!" />
                                <span className="text-base font-semibold">创作者仪表盘</span>
                            </a>
                        </Shadcn.SidebarMenuButton>
                    </Shadcn.SidebarMenuItem>
                </Shadcn.SidebarMenu>
            </Shadcn.SidebarHeader>
            <Shadcn.SidebarContent>
                <Prime.NavMain items={data.navMain} />
            </Shadcn.SidebarContent>
            <Shadcn.SidebarFooter>
                <Prime.NavUser />
            </Shadcn.SidebarFooter>
        </Shadcn.Sidebar>
    );
}
