"use client";

import { Shadcn } from "@/components";
import { useSidebar } from "@/components/@shadcn-ui/sidebar";
import {
    EllipsisVerticalIcon,
    CircleUserRoundIcon,
    CreditCardIcon,
    BellIcon,
    LogOutIcon,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";

export function NavUser() {
    const { isMobile } = useSidebar();
    const { user, userInitials } = useCurrentUser();

    const handleLogout = async () => {
        await fetch("/api/v1/auth/logout", { method: "POST", cache: "no-store" });
        toast.success("登出成功");
        window.location.href = "/";
    };

    if (!user) return null;

    return (
        <Shadcn.SidebarMenu>
            <Shadcn.SidebarMenuItem>
                <Shadcn.DropdownMenu>
                    <Shadcn.DropdownMenuTrigger asChild>
                        <Shadcn.SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <Shadcn.Avatar className="h-8 w-8 rounded-lg grayscale">
                                <Shadcn.AvatarImage src={user.avatar_url} alt={user.display_name} />
                                <Shadcn.AvatarFallback className="rounded-lg">
                                    {userInitials}
                                </Shadcn.AvatarFallback>
                            </Shadcn.Avatar>
                            <div className="grid flex-1 text-start text-sm leading-tight">
                                <span className="truncate font-medium">{user.display_name}</span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {user.email}
                                </span>
                            </div>
                            <EllipsisVerticalIcon className="ms-auto size-4" />
                        </Shadcn.SidebarMenuButton>
                    </Shadcn.DropdownMenuTrigger>
                    <Shadcn.DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}>
                        <Shadcn.DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                                <Shadcn.Avatar className="h-8 w-8 rounded-lg">
                                    <Shadcn.AvatarImage src={user.avatar_url} alt={user.display_name} />
                                    <Shadcn.AvatarFallback className="rounded-lg">
                                        {userInitials}
                                    </Shadcn.AvatarFallback>
                                </Shadcn.Avatar>
                                <div className="grid flex-1 text-start text-sm leading-tight">
                                    <span className="truncate font-medium">{user.display_name}</span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </Shadcn.DropdownMenuLabel>
                        <Shadcn.DropdownMenuSeparator />
                        <Shadcn.DropdownMenuGroup>
                            <Shadcn.DropdownMenuItem>
                                <CircleUserRoundIcon />
                                Account
                            </Shadcn.DropdownMenuItem>
                            <Shadcn.DropdownMenuItem>
                                <CreditCardIcon />
                                Billing
                            </Shadcn.DropdownMenuItem>
                            <Shadcn.DropdownMenuItem>
                                <BellIcon />
                                Notifications
                            </Shadcn.DropdownMenuItem>
                        </Shadcn.DropdownMenuGroup>
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
