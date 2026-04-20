"use client";

import * as React from "react";
import Link from "next/link";

import * as Shadcn from "@/components/@shadcn-ui";
import {
    LayoutDashboardIcon,
    FolderIcon,
    StoneIcon,
    HomeIcon,
    LayersIcon,
    TagsIcon,
} from "lucide-react";
import { CurrentUser } from "@/hooks/use-current-user";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const NAV_SECTIONS = [
    {
        text: "创作者功能",
        requiredRole: "creator" as const,
        items: [
            { title: "创作者仪表盘", url: "/dashboard", icon: <LayoutDashboardIcon /> },
            { title: "我的项目", url: "/dashboard/projects", icon: <FolderIcon /> },
        ],
    },
    {
        text: "管理员功能",
        requiredRole: "admin" as const,
        items: [
            { title: "管理员仪表盘", url: "/admin", icon: <StoneIcon /> },
            { title: "项目管理", url: "/admin/audit", icon: <LayersIcon /> },
            { title: "分类管理", url: "/admin/categories", icon: <TagsIcon /> },
        ],
    },
];

export type DashboardSidebarProps = React.ComponentProps<typeof Shadcn.Sidebar> & {
    title: string;
    homeHref: string;
    currentUser?: CurrentUser;
};

export function DashboardSidebar({
    title,
    homeHref,
    currentUser,
    ...props
}: DashboardSidebarProps) {
    return (
        <Shadcn.Sidebar collapsible="offcanvas" {...props}>
            <Shadcn.SidebarHeader>
                <Shadcn.SidebarMenu>
                    <Shadcn.SidebarMenuItem>
                        <Shadcn.SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:p-1.5!">
                            <Link href={homeHref}>
                                <StoneIcon className="size-5!" />
                                <span className="text-base font-semibold">{title}</span>
                            </Link>
                        </Shadcn.SidebarMenuButton>
                    </Shadcn.SidebarMenuItem>
                </Shadcn.SidebarMenu>
            </Shadcn.SidebarHeader>
            <Shadcn.SidebarContent>
                <NavMain currentUser={currentUser} items={NAV_SECTIONS} />
            </Shadcn.SidebarContent>
            <Shadcn.SidebarFooter>
                <Shadcn.SidebarMenu>
                    <Shadcn.SidebarMenuItem>
                        <Shadcn.SidebarMenuButton asChild>
                            <Link href="/">
                                <HomeIcon />
                                <span>返回主页</span>
                            </Link>
                        </Shadcn.SidebarMenuButton>
                    </Shadcn.SidebarMenuItem>
                </Shadcn.SidebarMenu>
                <NavUser currentUser={currentUser} />
            </Shadcn.SidebarFooter>
        </Shadcn.Sidebar>
    );
}
