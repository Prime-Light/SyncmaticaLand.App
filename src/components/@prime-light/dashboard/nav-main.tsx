"use client";

import { Button } from "@/components/@radix-ui/button";
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/@radix-ui/sidebar";
import { CirclePlusIcon, MailIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: React.ReactNode;
    }[];
}) {
    const t = useTranslations("Pages.Dashboard.Sidebar");

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2">
                        <SidebarMenuButton
                            tooltip={t("QuickCreate")}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear">
                            <CirclePlusIcon />
                            <span>{t("QuickCreate")}</span>
                        </SidebarMenuButton>
                        <Button size="icon" className="size-8 group-data-[collapsible=icon]:opacity-0" variant="outline">
                            <MailIcon />
                            <span className="sr-only">{t("Inbox")}</span>
                        </Button>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton tooltip={item.title}>
                                {item.icon}
                                <span>{item.title}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
