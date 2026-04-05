"use client";

import * as React from "react";

import { Shadcn, Prime } from "@/components";
import {
    LayoutDashboardIcon,
    ListIcon,
    ChartBarIcon,
    FolderIcon,
    UsersIcon,
    CameraIcon,
    FileTextIcon,
    Settings2Icon,
    CircleHelpIcon,
    SearchIcon,
    DatabaseIcon,
    FileChartColumnIcon,
    FileIcon,
    CommandIcon,
} from "lucide-react";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "#",
            icon: <LayoutDashboardIcon />,
        },
        {
            title: "Lifecycle",
            url: "#",
            icon: <ListIcon />,
        },
        {
            title: "Analytics",
            url: "#",
            icon: <ChartBarIcon />,
        },
        {
            title: "Projects",
            url: "#",
            icon: <FolderIcon />,
        },
        {
            title: "Team",
            url: "#",
            icon: <UsersIcon />,
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
    navSecondary: [
        {
            title: "Settings",
            url: "#",
            icon: <Settings2Icon />,
        },
        {
            title: "Get Help",
            url: "#",
            icon: <CircleHelpIcon />,
        },
        {
            title: "Search",
            url: "#",
            icon: <SearchIcon />,
        },
    ],
    documents: [
        {
            name: "Data Library",
            url: "#",
            icon: <DatabaseIcon />,
        },
        {
            name: "Reports",
            url: "#",
            icon: <FileChartColumnIcon />,
        },
        {
            name: "Word Assistant",
            url: "#",
            icon: <FileIcon />,
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
                <Prime.NavDocuments items={data.documents} />
                <Prime.NavSecondary items={data.navSecondary} className="mt-auto" />
            </Shadcn.SidebarContent>
            <Shadcn.SidebarFooter>
                <Prime.NavUser user={data.user} />
            </Shadcn.SidebarFooter>
        </Shadcn.Sidebar>
    );
}
