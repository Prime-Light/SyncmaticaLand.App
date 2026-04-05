"use client";

import { Shadcn } from "@/components";
import { useSidebar } from "@/components/@shadcn-ui/sidebar";
import { MoreHorizontalIcon, FolderIcon, ShareIcon, Trash2Icon } from "lucide-react";

export function NavDocuments({
    items,
}: {
    items: {
        name: string;
        url: string;
        icon: React.ReactNode;
    }[];
}) {
    const { isMobile } = useSidebar();

    return (
        <Shadcn.SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <Shadcn.SidebarGroupLabel>Documents</Shadcn.SidebarGroupLabel>
            <Shadcn.SidebarMenu>
                {items.map((item) => (
                    <Shadcn.SidebarMenuItem key={item.name}>
                        <Shadcn.SidebarMenuButton asChild>
                            <a href={item.url}>
                                {item.icon}
                                <span>{item.name}</span>
                            </a>
                        </Shadcn.SidebarMenuButton>
                        <Shadcn.DropdownMenu>
                            <Shadcn.DropdownMenuTrigger asChild>
                                <Shadcn.SidebarMenuAction
                                    showOnHover
                                    className="rounded-sm data-[state=open]:bg-accent">
                                    <MoreHorizontalIcon />
                                    <span className="sr-only">More</span>
                                </Shadcn.SidebarMenuAction>
                            </Shadcn.DropdownMenuTrigger>
                            <Shadcn.DropdownMenuContent
                                className="w-24 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align={isMobile ? "end" : "start"}>
                                <Shadcn.DropdownMenuItem>
                                    <FolderIcon />
                                    <span>Open</span>
                                </Shadcn.DropdownMenuItem>
                                <Shadcn.DropdownMenuItem>
                                    <ShareIcon />
                                    <span>Share</span>
                                </Shadcn.DropdownMenuItem>
                                <Shadcn.DropdownMenuSeparator />
                                <Shadcn.DropdownMenuItem variant="destructive">
                                    <Trash2Icon />
                                    <span>Delete</span>
                                </Shadcn.DropdownMenuItem>
                            </Shadcn.DropdownMenuContent>
                        </Shadcn.DropdownMenu>
                    </Shadcn.SidebarMenuItem>
                ))}
                <Shadcn.SidebarMenuItem>
                    <Shadcn.SidebarMenuButton className="text-sidebar-foreground/70">
                        <MoreHorizontalIcon className="text-sidebar-foreground/70" />
                        <span>More</span>
                    </Shadcn.SidebarMenuButton>
                </Shadcn.SidebarMenuItem>
            </Shadcn.SidebarMenu>
        </Shadcn.SidebarGroup>
    );
}
