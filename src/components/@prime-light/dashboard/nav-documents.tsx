"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/@radix-ui/dropdown-menu";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/@radix-ui/sidebar";
import { MoreHorizontalIcon, FolderIcon, ShareIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

export function NavDocuments({
    items,
}: {
    items: {
        name: string;
        url: string;
        icon: React.ReactNode;
    }[];
}) {
    const t = useTranslations("Pages.Dashboard.Sidebar");
    const { isMobile } = useSidebar();

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>{t("Documents.Label")}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild>
                            <a href={item.url}>
                                {item.icon}
                                <span>{item.name}</span>
                            </a>
                        </SidebarMenuButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuAction showOnHover className="data-[state=open]:bg-accent rounded-sm">
                                    <MoreHorizontalIcon />
                                    <span className="sr-only">{t("Documents.More")}</span>
                                </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-24 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align={isMobile ? "end" : "start"}>
                                <DropdownMenuItem>
                                    <FolderIcon />
                                    <span>{t("Documents.Open")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <ShareIcon />
                                    <span>{t("Documents.Share")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive">
                                    <Trash2Icon />
                                    <span>{t("Documents.Delete")}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                    <SidebarMenuButton className="text-sidebar-foreground/70">
                        <MoreHorizontalIcon className="text-sidebar-foreground/70" />
                        <span>{t("Documents.More")}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}
