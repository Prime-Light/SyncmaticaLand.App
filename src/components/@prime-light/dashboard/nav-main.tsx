"use client";

import { Shadcn } from "@/components";
import { CirclePlusIcon, MailIcon } from "lucide-react";

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: React.ReactNode;
    }[];
}) {
    return (
        <Shadcn.SidebarGroup>
            <Shadcn.SidebarGroupContent className="flex flex-col gap-2">
                <Shadcn.SidebarMenu>
                    <Shadcn.SidebarMenuItem className="flex items-center gap-2">
                        <Shadcn.SidebarMenuButton
                            tooltip="Quick Create"
                            className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground">
                            <CirclePlusIcon />
                            <span>Quick Create</span>
                        </Shadcn.SidebarMenuButton>
                        <Shadcn.Button size="icon" className="size-8 group-data-[collapsible=icon]:opacity-0" variant="outline">
                            <MailIcon />
                            <span className="sr-only">Inbox</span>
                        </Shadcn.Button>
                    </Shadcn.SidebarMenuItem>
                </Shadcn.SidebarMenu>
                <Shadcn.SidebarMenu>
                    {items.map((item) => (
                        <Shadcn.SidebarMenuItem key={item.title}>
                            <Shadcn.SidebarMenuButton tooltip={item.title}>
                                {item.icon}
                                <span>{item.title}</span>
                            </Shadcn.SidebarMenuButton>
                        </Shadcn.SidebarMenuItem>
                    ))}
                </Shadcn.SidebarMenu>
            </Shadcn.SidebarGroupContent>
        </Shadcn.SidebarGroup>
    );
}
