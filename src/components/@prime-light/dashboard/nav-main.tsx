"use client";

import { Shadcn } from "@/components";
import { CirclePlusIcon } from "lucide-react";

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
                    <Shadcn.SidebarMenuItem>
                        <Shadcn.SidebarMenuButton
                            tooltip="上传原理图"
                            className="bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground">
                            <CirclePlusIcon />
                            <span>上传原理图</span>
                        </Shadcn.SidebarMenuButton>
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
