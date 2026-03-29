"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    CodeIcon,
    Grid3X3Icon,
    HomeIcon,
    MenuIcon,
    StoneIcon,
    UserKeyIcon,
    UserPlusIcon,
    LogOutIcon,
    MailWarningIcon,
    MailCheckIcon,
    Loader2Icon,
    SparklesIcon,
    ShieldUserIcon,
} from "lucide-react";
import Cookies from "js-cookie";
import { Prime, Shadcn } from "@/components";
import { cn } from "@/lib/utils";
import { logoutAction, resendEmailVerificationAction } from "@/lib/auth/session";

interface NavbarProps {
    className?: string;
}

interface CurrentUser {
    id: string;
    name: string;
    email: string;
    emailVerification: boolean;
    labels: string[];
}

const navItems = [
    { label: "首页", href: "/", icon: HomeIcon },
    { label: "原理图", href: "/schematics", icon: Grid3X3Icon },
    { label: "API 文档", href: "/api-docs", icon: CodeIcon },
];

// 用户信息头部组件（统一桌面端和移动端）
function UserMenuHeader({ user, userInitials }: { user: CurrentUser; userInitials: string }) {
    return (
        <Shadcn.DropdownMenuLabel className="space-y-2">
            <div className="flex items-center gap-2">
                <Shadcn.Avatar size="sm">
                    <Shadcn.AvatarFallback>{userInitials}</Shadcn.AvatarFallback>
                </Shadcn.Avatar>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">{user.name || "用户"}</span>
                        {user.labels.includes("admin") && (
                            <Shadcn.Badge
                                variant="outline"
                                className="h-5 gap-1 border-red-500/50 bg-red-500/10 px-1.5 text-[10px] text-red-700 dark:text-red-300">
                                <ShieldUserIcon />
                                管理员
                            </Shadcn.Badge>
                        )}
                        {user.labels.includes("premium") && (
                            <Shadcn.Badge
                                variant="outline"
                                className="h-5 gap-1 border-purple-500/50 bg-purple-500/10 px-1.5 text-[10px] text-purple-700 dark:text-purple-300">
                                <SparklesIcon />
                                高级用户
                            </Shadcn.Badge>
                        )}
                    </div>
                </div>
            </div>
            {!user.emailVerification && (
                <Shadcn.Badge variant="destructive" className="w-full justify-center gap-1.5">
                    <MailWarningIcon />
                    邮箱未验证
                </Shadcn.Badge>
            )}
        </Shadcn.DropdownMenuLabel>
    );
}

// 邮箱验证提醒组件（统一桌面端和移动端）
function VerificationAlert({
    onResend,
    isResending,
    verificationNotice,
}: {
    onResend: () => void;
    isResending: boolean;
    verificationNotice: "" | "sent" | "failed";
}) {
    return (
        <div className="px-2 py-2">
            <Shadcn.Alert className="border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300">
                <MailWarningIcon className="text-amber-600 dark:text-amber-400" />
                <Shadcn.AlertTitle>验证邮箱</Shadcn.AlertTitle>
                <Shadcn.AlertDescription className="text-amber-700/80 dark:text-amber-400/80">
                    <span>请验证您的邮箱地址以解锁全部功能</span>
                    <Shadcn.Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full border-amber-500/50 bg-amber-500/5 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
                        onClick={onResend}
                        disabled={isResending || verificationNotice === "sent"}>
                        {isResending ? (
                            <Loader2Icon className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : verificationNotice === "sent" ? (
                            <MailCheckIcon className="mr-1.5 h-3.5 w-3.5" />
                        ) : (
                            <MailWarningIcon className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {verificationNotice === "sent" ? "已发送" : "重新发送验证邮件"}
                    </Shadcn.Button>
                    {verificationNotice === "failed" && <p className="mt-2 text-center text-xs text-destructive">发送失败，请重试</p>}
                </Shadcn.AlertDescription>
            </Shadcn.Alert>
        </div>
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

// 导航栏组件
export function Navbar({ className }: NavbarProps) {
    const pathname = usePathname();
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [verificationNotice, setVerificationNotice] = useState<"" | "sent" | "failed">("");
    const [isResending, setIsResending] = useState(false);
    const [, startTransition] = useTransition();

    useEffect(() => {
        let mounted = true;

        // 从本地存储中获取用户信息
        const cachedUser = Cookies.get("sl-data-session");
        if (cachedUser) {
            setUser(JSON.parse(cachedUser));
        }

        fetch("/api/account/me", { method: "GET", cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) return null;
                return (await res.json()) as { user: CurrentUser | null };
            })
            .then((data) => {
                if (!mounted) return;
                setUser(data?.user ?? null);
                Cookies.set("sl-data-session", JSON.stringify(data?.user ?? null), { expires: 1 });
            })
            .catch(() => {
                if (!mounted) return;
                setUser(null);
                Cookies.set("sl-data-session", JSON.stringify(null), { expires: 1 });
            });

        return () => {
            mounted = false;
        };
    }, []);

    const userInitials = useMemo(() => {
        const seed = user?.name?.trim() || user?.email?.trim() || "";
        if (!seed) return "U";
        return seed[0].toUpperCase();
    }, [user]);

    const handleLogout = () => {
        startTransition(async () => {
            await logoutAction();
            window.location.assign("/");
        });
    };

    const handleResendVerification = () => {
        setIsResending(true);
        startTransition(async () => {
            try {
                const result = await resendEmailVerificationAction();
                setVerificationNotice(result.success ? "sent" : "failed");
            } finally {
                setIsResending(false);
            }
        });
    };

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full border-b h-14 max-h-14 border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
                className
            )}>
            <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6">
                {/* 左侧：Logo 和标题 */}
                <Link href="/" className="flex items-center gap-1.5">
                    <div className="flex size-9 items-center justify-center">
                        <StoneIcon className="size-6 text-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm leading-tight font-semibold tracking-tight">SyncmaticaLand</span>
                        <span className="text-xs leading-tight font-medium text-muted-foreground">投影共和国</span>
                    </div>
                </Link>

                {/* 桌面端：导航菜单 */}
                <div className="hidden md:flex">
                    <Shadcn.NavigationMenu>
                        <Shadcn.NavigationMenuList className="gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                                return (
                                    <Shadcn.NavigationMenuItem key={item.href}>
                                        <Shadcn.NavigationMenuLink asChild>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                                                    "hover:bg-accent hover:text-accent-foreground",
                                                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                                                    "disabled:pointer-events-none disabled:opacity-50",
                                                    isActive
                                                        ? "bg-accent text-accent-foreground"
                                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                )}>
                                                <Icon />
                                                {item.label}
                                            </Link>
                                        </Shadcn.NavigationMenuLink>
                                    </Shadcn.NavigationMenuItem>
                                );
                            })}
                        </Shadcn.NavigationMenuList>
                        <Shadcn.Separator className="mx-4 my-auto h-3/4" orientation="vertical" />
                        <Shadcn.NavigationMenuList className="gap-1">
                            {user ? (
                                <Shadcn.DropdownMenu>
                                    <Shadcn.DropdownMenuTrigger asChild>
                                        <Shadcn.Button variant="ghost" size="lg" className="gap-2 px-3">
                                            <Shadcn.Avatar size="sm">
                                                <Shadcn.AvatarFallback>{userInitials}</Shadcn.AvatarFallback>
                                            </Shadcn.Avatar>
                                            <span className="hidden lg:inline">{user.name || "用户"}</span>
                                            {!user.emailVerification && (
                                                <Shadcn.Badge variant="destructive" className="gap-1">
                                                    <MailWarningIcon />
                                                    未验证
                                                </Shadcn.Badge>
                                            )}
                                        </Shadcn.Button>
                                    </Shadcn.DropdownMenuTrigger>
                                    <Shadcn.DropdownMenuContent align="end" className="w-64">
                                        <UserMenuHeader user={user} userInitials={userInitials} />
                                        {!user.emailVerification && (
                                            <>
                                                <Shadcn.DropdownMenuSeparator />
                                                <VerificationAlert
                                                    onResend={handleResendVerification}
                                                    isResending={isResending}
                                                    verificationNotice={verificationNotice}
                                                />
                                            </>
                                        )}
                                        <Shadcn.DropdownMenuSeparator />
                                        <LogoutItem onLogout={handleLogout} />
                                    </Shadcn.DropdownMenuContent>
                                </Shadcn.DropdownMenu>
                            ) : (
                                <>
                                    <Shadcn.NavigationMenuItem>
                                        <Shadcn.NavigationMenuLink asChild>
                                            <Link
                                                href="/auth/login"
                                                className={cn(
                                                    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                                                    "hover:bg-accent hover:text-accent-foreground",
                                                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                                                    "disabled:pointer-events-none disabled:opacity-50"
                                                )}>
                                                <UserKeyIcon />
                                                登录
                                            </Link>
                                        </Shadcn.NavigationMenuLink>
                                    </Shadcn.NavigationMenuItem>
                                    <Shadcn.NavigationMenuItem>
                                        <Shadcn.NavigationMenuLink asChild>
                                            <Link
                                                href="/auth/signup"
                                                className={cn(
                                                    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                                                    "hover:bg-accent hover:text-accent-foreground",
                                                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                                                    "disabled:pointer-events-none disabled:opacity-50"
                                                )}>
                                                <UserPlusIcon />
                                                注册
                                            </Link>
                                        </Shadcn.NavigationMenuLink>
                                    </Shadcn.NavigationMenuItem>
                                </>
                            )}
                        </Shadcn.NavigationMenuList>
                        <Shadcn.Separator className="mx-4 my-auto h-3/4" orientation="vertical" />
                        <Prime.ThemeToggle />
                    </Shadcn.NavigationMenu>
                </div>

                {/* 移动端：下拉菜单 */}
                <div className="md:hidden">
                    <Shadcn.DropdownMenu>
                        <Shadcn.DropdownMenuTrigger asChild>
                            <Shadcn.Button variant="ghost" size="icon">
                                <MenuIcon />
                            </Shadcn.Button>
                        </Shadcn.DropdownMenuTrigger>
                        <Shadcn.DropdownMenuContent align="end" className="w-64">
                            {/* 导航项 */}
                            <Shadcn.DropdownMenuGroup>
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                                    return (
                                        <Shadcn.DropdownMenuItem key={item.href} asChild>
                                            <Link href={item.href} className={cn(isActive && "bg-accent text-accent-foreground")}>
                                                <Icon />
                                                {item.label}
                                            </Link>
                                        </Shadcn.DropdownMenuItem>
                                    );
                                })}
                            </Shadcn.DropdownMenuGroup>

                            <Shadcn.DropdownMenuSeparator />

                            {/* 用户区域 */}
                            {user ? (
                                <>
                                    <UserMenuHeader user={user} userInitials={userInitials} />
                                    {!user.emailVerification && (
                                        <>
                                            <Shadcn.DropdownMenuSeparator />
                                            <VerificationAlert
                                                onResend={handleResendVerification}
                                                isResending={isResending}
                                                verificationNotice={verificationNotice}
                                            />
                                        </>
                                    )}
                                    <Shadcn.DropdownMenuSeparator />
                                    <LogoutItem onLogout={handleLogout} />
                                </>
                            ) : (
                                <>
                                    <Shadcn.DropdownMenuItem asChild>
                                        <Link href="/auth/login">
                                            <UserKeyIcon />
                                            登录
                                        </Link>
                                    </Shadcn.DropdownMenuItem>
                                    <Shadcn.DropdownMenuItem asChild>
                                        <Link href="/auth/signup">
                                            <UserPlusIcon />
                                            注册
                                        </Link>
                                    </Shadcn.DropdownMenuItem>
                                </>
                            )}
                        </Shadcn.DropdownMenuContent>
                    </Shadcn.DropdownMenu>
                </div>
            </div>
        </header>
    );
}
