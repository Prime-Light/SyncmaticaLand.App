"use client";

import * as React from "react";

import { Shadcn } from "@/components";

export function NavSecondary({
    items,
    ...props
}: {
    items: {
        title: string;
        url: string;
        icon: React.ReactNode;
    }[];
} & React.ComponentPropsWithoutRef<typeof Shadcn.SidebarGroup>) {
    return (
        <Shadcn.SidebarGroup {...props}>
            <Shadcn.SidebarGroupContent>
                <Shadcn.SidebarMenu>
                    {items.map((item) => (
                        <Shadcn.SidebarMenuItem key={item.title}>
                            <Shadcn.SidebarMenuButton asChild>
                                <a href={item.url}>
                                    {item.icon}
                                    <span>{item.title}</span>
                                </a>
                            </Shadcn.SidebarMenuButton>
                        </Shadcn.SidebarMenuItem>
                    ))}
                </Shadcn.SidebarMenu>
            </Shadcn.SidebarGroupContent>
        </Shadcn.SidebarGroup>
    );
}
