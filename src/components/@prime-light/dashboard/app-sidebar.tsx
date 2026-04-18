"use client";

import * as React from "react";
import Link from "next/link";

import { Shadcn, Prime } from "@/components";
import { LayoutDashboardIcon, FolderIcon, StoneIcon, HomeIcon, ScaleIcon, TagsIcon } from "lucide-react";
import { CurrentUser } from "@/hooks/use-current-user";

const data = [
    {
        text: "创作者功能",
        requiredRole: "creator" as const,
        items: [
            {
                title: "创作者仪表盘",
                url: "/dashboard",
                icon: <LayoutDashboardIcon />,
            },
            {
                title: "我的项目",
                url: "/dashboard/projects",
                icon: <FolderIcon />,
            },
        ],
    },
    {
        text: "管理员功能",
        requiredRole: "admin" as const,
        items: [
            {
                title: "管理员仪表盘",
                url: "/admin",
                icon: <StoneIcon />,
            },
            {
                title: "项目审核",
                url: "/admin/audit",
                icon: <ScaleIcon />,
            },
            {
                title: "分类管理",
                url: "/admin/categories",
                icon: <TagsIcon />,
            },
        ],
    },
];

export function AppSidebar({
    currentUser,
    ...props
}: React.ComponentProps<typeof Shadcn.Sidebar> & { currentUser?: CurrentUser }) {
    return (
        <Shadcn.Sidebar collapsible="offcanvas" {...props}>
            <Shadcn.SidebarHeader>
                <Shadcn.SidebarMenu>
                    <Shadcn.SidebarMenuItem>
                        <Shadcn.SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:p-1.5!">
                            <Link href="/dashboard">
                                <StoneIcon className="size-5!" />
                                <span className="text-base font-semibold">仪表盘</span>
                            </Link>
                        </Shadcn.SidebarMenuButton>
                    </Shadcn.SidebarMenuItem>
                </Shadcn.SidebarMenu>
            </Shadcn.SidebarHeader>
            <Shadcn.SidebarContent>
                <Prime.NavMain currentUser={currentUser} items={data} />
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
                <Prime.NavUser />
            </Shadcn.SidebarFooter>
        </Shadcn.Sidebar>
    );
}
