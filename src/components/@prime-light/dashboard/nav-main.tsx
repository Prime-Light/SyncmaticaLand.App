"use client";

import Link from "next/link";
import { Shadcn } from "@/components";
import { CirclePlusIcon } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel } from "@/components/@shadcn-ui";
import { CurrentUser } from "@/hooks/use-current-user";

type UserRole = "user" | "creator" | "admin";

const ROLE_HIERARCHY: Record<UserRole, number> = {
    user: 0,
    creator: 1,
    admin: 2,
};

function hasRequiredRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
    if (!userRole) return false;
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

interface ButtonItem {
    title: string;
    url: string;
    icon?: React.ReactNode;
    requiredRole?: UserRole;
}

interface SectionItem {
    text: string;
    items: ButtonItem[];
    requiredRole?: UserRole;
}

export function NavMain({
    items,
    currentUser,
}: {
    items: SectionItem[];
    currentUser?: CurrentUser;
}) {
    const userRole = currentUser?.role as UserRole | undefined;

    const filteredItems = items.filter((sItem) => {
        const sectionRole = sItem.requiredRole ?? "user";
        return hasRequiredRole(userRole, sectionRole);
    });

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
                {filteredItems.map((sItem) => (
                    <Shadcn.SidebarMenu key={sItem.text}>
                        <SidebarGroup className="p-0">
                            <SidebarGroupLabel>{sItem.text}</SidebarGroupLabel>
                            {sItem.items
                                .filter((item) =>
                                    hasRequiredRole(
                                        userRole,
                                        item.requiredRole ?? sItem.requiredRole ?? "user"
                                    )
                                )
                                .map((item) => (
                                    <Shadcn.SidebarMenuItem key={item.title}>
                                        <Shadcn.SidebarMenuButton asChild tooltip={item.title}>
                                            <Link href={item.url}>
                                                {item.icon}
                                                <span>{item.title}</span>
                                            </Link>
                                        </Shadcn.SidebarMenuButton>
                                    </Shadcn.SidebarMenuItem>
                                ))}
                        </SidebarGroup>
                    </Shadcn.SidebarMenu>
                ))}
            </Shadcn.SidebarGroupContent>
        </Shadcn.SidebarGroup>
    );
}
