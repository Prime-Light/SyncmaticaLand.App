"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
    ChartBarIcon,
    FolderIcon,
    HouseIcon,
    LayoutDashboardIcon,
    LockIcon,
    LogInIcon,
    Settings2Icon,
    Stone,
    UserPlusIcon,
} from "lucide-react";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/@radix-ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/@radix-ui/card";
import { Button } from "@/components/@radix-ui/button";
import { useRouter } from "next/navigation";

interface DashboardUser {
    $id: string;
    name: string;
    email: string;
    emailVerification: boolean;
}

export function AppSidebar({
    user,
    ...props
}: React.ComponentProps<typeof Sidebar> & {
    user: DashboardUser | null;
}) {
    const t = useTranslations("Pages.Dashboard.Sidebar");
    const router = useRouter();

    const sidebarUser = user
        ? {
              name: user.name,
              email: user.email,
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
          }
        : {
              name: t("UserMenu.GuestUser") || "Guest",
              email: t("UserMenu.GuestEmail") || "Not logged in",
              avatar: "",
          };

    const navMain = [
        { title: t("NavMain.Dashboard"), url: "#", icon: <LayoutDashboardIcon /> },
        { title: t("NavMain.Analytics"), url: "#", icon: <ChartBarIcon /> },
        { title: t("NavMain.Projects"), url: "#", icon: <FolderIcon /> },
    ];

    const navSecondary = [
        { title: t("Secondary.BackToHome"), url: "/", icon: <HouseIcon /> },
        { title: t("Secondary.Settings"), url: "#", icon: <Settings2Icon /> },
    ];

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
                            <a href="#">
                                <Stone className="size-5!" />
                                <span className="text-base font-semibold">{t("CreatorPanel")}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {user ? (
                    <NavMain items={navMain} />
                ) : (
                    <Card size="sm" className="mx-2 mt-2 border-dashed">
                        <CardHeader className="pb-0">
                            <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                                <LockIcon className="text-muted-foreground size-5" />
                            </div>
                            <CardTitle className="text-sm">{t("GuestCard.Title")}</CardTitle>
                            <CardDescription className="text-xs">{t("GuestCard.Description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-1 pt-0">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start gap-2"
                                onClick={() => router.push("/auth/login")}>
                                <LogInIcon className="size-4" />
                                {t("GuestCard.Login")}
                            </Button>
                            <Button size="sm" className="w-full justify-start gap-2" onClick={() => router.push("/auth/signup")}>
                                <UserPlusIcon className="size-4" />
                                {t("GuestCard.Signup")}
                            </Button>
                        </CardContent>
                    </Card>
                )}
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={sidebarUser} />
            </SidebarFooter>
        </Sidebar>
    );
}
