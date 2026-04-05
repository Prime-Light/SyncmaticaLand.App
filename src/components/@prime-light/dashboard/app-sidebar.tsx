"use client";

import * as React from "react";

import { Shadcn, Prime } from "@/components";
import {
    LayoutDashboardIcon,
    FolderIcon,
    CameraIcon,
    FileTextIcon,
    CommandIcon,
} from "lucide-react";

const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "#",
            icon: <LayoutDashboardIcon />,
        },
        {
            title: "Projects",
            url: "#",
            icon: <FolderIcon />,
        },
    ],
    navClouds: [
        {
            title: "Capture",
            icon: <CameraIcon />,
            isActive: true,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
        {
            title: "Proposal",
            icon: <FileTextIcon />,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
        {
            title: "Prompts",
            icon: <FileTextIcon />,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
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
                                <CommandIcon className="size-5!" />
                                <span className="text-base font-semibold">Acme Inc.</span>
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
