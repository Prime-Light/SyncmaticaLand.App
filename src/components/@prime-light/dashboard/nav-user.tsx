"use client";

import { Avatar, AvatarFallback } from "@/components/@radix-ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/@radix-ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/@radix-ui/sidebar";
import { logoutAction } from "@/lib/auth/session";
import { EllipsisVerticalIcon, CircleUserRoundIcon, CreditCardIcon, BellIcon, LogOutIcon, LogInIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NavUserProps {
    user: {
        name: string;
        email: string;
        avatar: string;
    };
}

export function NavUser({ user }: NavUserProps) {
    const t = useTranslations("Pages.Dashboard.Sidebar.UserMenu");
    const { isMobile } = useSidebar();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logoutAction();
            // 登出后强制刷新页面，确保状态完全重置
            window.location.href = "/";
        } catch {
            setIsLoggingOut(false);
        }
    };

    const isGuest = user.name === t("GuestUser") || user.name === "Guest";

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <Avatar className="h-8 w-8 rounded-lg grayscale">
                                <AvatarFallback className="rounded-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-start text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                            </div>
                            <EllipsisVerticalIcon className="ms-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}>
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-start text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {!isGuest && (
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <CircleUserRoundIcon />
                                    {t("Account")}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <CreditCardIcon />
                                    {t("Billing")}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <BellIcon />
                                    {t("Notifications")}
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        )}
                        {!isGuest && <DropdownMenuSeparator />}
                        {isGuest ? (
                            <DropdownMenuItem onClick={() => router.push("/auth/login")}>
                                <LogInIcon />
                                {t("Login")}
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} variant="destructive">
                                <LogOutIcon />
                                {isLoggingOut ? t("LoggingOut") : t("Logout")}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
