"use client";

import Link from "next/link";
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
                            asChild
                            tooltip="上传原理图"
                            className="bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground">
                            <Link href="/dashboard/upload">
                                <CirclePlusIcon />
                                <span>上传原理图</span>
                            </Link>
                        </Shadcn.SidebarMenuButton>
                    </Shadcn.SidebarMenuItem>
                </Shadcn.SidebarMenu>
                <Shadcn.SidebarMenu>
                    {items.map((item) => (
                        <Shadcn.SidebarMenuItem key={item.title}>
                            <Shadcn.SidebarMenuButton asChild tooltip={item.title}>
                                <Link href={item.url}>
                                    {item.icon}
                                    <span>{item.title}</span>
                                </Link>
                            </Shadcn.SidebarMenuButton>
                        </Shadcn.SidebarMenuItem>
                    ))}
                </Shadcn.SidebarMenu>
            </Shadcn.SidebarGroupContent>
        </Shadcn.SidebarGroup>
    );
}
