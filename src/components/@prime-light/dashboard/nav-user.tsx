"use client";

import { Shadcn } from "@/components";
import { useSidebar } from "@/components/@shadcn-ui/sidebar";
import {
    EllipsisVerticalIcon,
    LogOutIcon,
    ShieldUserIcon,
    SparklesIcon,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";
import { Auth } from "@/schema";

// 用户信息头部组件（统一桌面端和移动端）
function UserMenuHeader({
    user,
    userInitials,
}: {
    user: Auth.Me.Me.Res["user"];
    userInitials: string;
}) {
    return (
        <Shadcn.DropdownMenuLabel className="space-y-2">
            <div className="flex items-center gap-2">
                <Shadcn.Avatar size="sm">
                    <Shadcn.AvatarImage src={user.avatar_url} />
                    <Shadcn.AvatarFallback>{userInitials}</Shadcn.AvatarFallback>
                </Shadcn.Avatar>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">
                            {user.display_name || "用户"}
                        </span>
                        {user.role === "admin" && (
                            <Shadcn.Badge
                                variant="outline"
                                className="h-5 gap-1 border-red-500/50 bg-red-500/10 px-1.5 text-[10px] text-red-700 dark:text-red-300">
                                <ShieldUserIcon />
                                管理员
                            </Shadcn.Badge>
                        )}
                        {user.role === "creator" && (
                            <Shadcn.Badge
                                variant="outline"
                                className="h-5 gap-1 border-purple-500/50 bg-purple-500/10 px-1.5 text-[10px] text-purple-700 dark:text-purple-300">
                                <SparklesIcon />
                                创作者
                            </Shadcn.Badge>
                        )}
                    </div>
                </div>
            </div>
        </Shadcn.DropdownMenuLabel>
    );
}

// 退出登录组件
function LogoutItem({ onLogout }: { onLogout: () => void }) {
    return (
        <Shadcn.DropdownMenuItem variant="destructive" onClick={onLogout}>
            <LogOutIcon />
            退出登录
        </Shadcn.DropdownMenuItem>
    );
}

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
                            </div>
                            <EllipsisVerticalIcon className="ms-auto size-4" />
                        </Shadcn.SidebarMenuButton>
                    </Shadcn.DropdownMenuTrigger>
                    <Shadcn.DropdownMenuContent
                        className="w-64"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}>
                        <UserMenuHeader user={user} userInitials={userInitials} />
                        <Shadcn.DropdownMenuSeparator />
                        <LogoutItem onLogout={handleLogout} />
                    </Shadcn.DropdownMenuContent>
                </Shadcn.DropdownMenu>
            </Shadcn.SidebarMenuItem>
        </Shadcn.SidebarMenu>
    );
}
