"use client";

import { Shadcn } from "@/components";
import { useSidebar } from "@/components/@shadcn-ui/sidebar";
import { EllipsisVerticalIcon, LogOutIcon } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";

export function NavUser() {
    const { isMobile } = useSidebar();
    const { user, loading, userInitials } = useCurrentUser();

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/v1/auth/logout", {
                method: "POST",
                cache: "no-store",
            });
            if (!res.ok) {
                toast.error("登出失败，请稍后重试");
                return;
            }
            toast.success("登出成功");
            window.location.href = "/";
        } catch {
            toast.error("登出失败，请检查网络连接");
        }
    };

    if (loading)
        return (
            <Shadcn.SidebarMenu>
                <Shadcn.SidebarMenuItem>
                    <Shadcn.SidebarMenuButton size="lg" disabled>
                        <Shadcn.Skeleton className="h-8 w-8 rounded-full" />
                        <div className="grid flex-1 gap-1">
                            <Shadcn.Skeleton className="h-3 w-24" />
                            <Shadcn.Skeleton className="h-3 w-32" />
                        </div>
                    </Shadcn.SidebarMenuButton>
                </Shadcn.SidebarMenuItem>
            </Shadcn.SidebarMenu>
        );

    if (!user)
        return (
            <Shadcn.SidebarMenu>
                <Shadcn.SidebarMenuItem>
                    <Shadcn.SidebarMenuButton
                        size="lg"
                        onClick={() => (window.location.href = "/auth/login")}>
                        <Shadcn.Avatar className="h-8 w-8">
                            <Shadcn.AvatarFallback>?</Shadcn.AvatarFallback>
                        </Shadcn.Avatar>
                        <div className="grid flex-1 text-start text-sm leading-tight">
                            <span className="truncate font-medium">未登录</span>
                            <span className="truncate text-xs text-muted-foreground">
                                点击前往登录
                            </span>
                        </div>
                    </Shadcn.SidebarMenuButton>
                </Shadcn.SidebarMenuItem>
            </Shadcn.SidebarMenu>
        );

    return (
        <Shadcn.SidebarMenu>
            <Shadcn.SidebarMenuItem>
                <Shadcn.DropdownMenu>
                    <Shadcn.DropdownMenuTrigger asChild>
                        <Shadcn.SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <Shadcn.Avatar className="h-8 w-8 grayscale">
                                <Shadcn.AvatarImage
                                    src={user.avatar_url}
                                    alt={user.display_name}
                                />
                                <Shadcn.AvatarFallback>{userInitials}</Shadcn.AvatarFallback>
                            </Shadcn.Avatar>
                            <div className="grid flex-1 text-start text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {user.display_name}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {user.email}
                                </span>
                            </div>
                            <EllipsisVerticalIcon className="ms-auto size-4" />
                        </Shadcn.SidebarMenuButton>
                    </Shadcn.DropdownMenuTrigger>
                    <Shadcn.DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}>
                        <Shadcn.DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                                <Shadcn.Avatar className="h-8 w-8">
                                    <Shadcn.AvatarImage
                                        src={user.avatar_url}
                                        alt={user.display_name}
                                    />
                                    <Shadcn.AvatarFallback>
                                        {userInitials}
                                    </Shadcn.AvatarFallback>
                                </Shadcn.Avatar>
                                <div className="grid flex-1 text-start text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {user.display_name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </Shadcn.DropdownMenuLabel>
                        <Shadcn.DropdownMenuSeparator />
                        <Shadcn.DropdownMenuItem variant="destructive" onClick={handleLogout}>
                            <LogOutIcon />
                            退出登录
                        </Shadcn.DropdownMenuItem>
                    </Shadcn.DropdownMenuContent>
                </Shadcn.DropdownMenu>
            </Shadcn.SidebarMenuItem>
        </Shadcn.SidebarMenu>
    );
}
