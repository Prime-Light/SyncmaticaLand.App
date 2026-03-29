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
import { Prime, Shadcn } from "@/components";
import { cn } from "@/lib/utils";
import { logoutAction, resendEmailVerificationAction } from "@/lib/auth/session";
import { Avatar, AvatarFallback } from "@/components/@shadcn-ui/avatar";
import { Button } from "@/components/@shadcn-ui/button";

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

export function Navbar({ className }: NavbarProps) {
    const pathname = usePathname();
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [verificationNotice, setVerificationNotice] = useState<"" | "sent" | "failed">("");
    const [isResending, setIsResending] = useState(false);
    const [, startTransition] = useTransition();

    useEffect(() => {
        let mounted = true;

        fetch("/api/account/me", { method: "GET", cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) return null;
                return (await res.json()) as { user: CurrentUser | null };
            })
            .then((data) => {
                if (!mounted) return;
                setUser(data?.user ?? null);
            })
            .catch(() => {
                if (!mounted) return;
                setUser(null);
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
                "fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
                className
            )}>
            <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6">
                {/* 左侧：Logo 和标题 */}
                <Link href="/" className="flex items-center gap-1.5">
                    {/* 黑白风格的 Stone 图标 */}
                    <div className="flex size-9 items-center justify-center">
                        <StoneIcon className="size-6 text-foreground" strokeWidth={1.5} />
                    </div>
                    {/* 叠在一起的标题 */}
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
                                const isActive =
                                    item.href === "/"
                                        ? pathname === "/" // 只有严格等于 / 才激活
                                        : pathname.startsWith(item.href); // 其他路径用 startsWith 避免过宽匹配
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
                                                <Icon className="size-3.5" strokeWidth={2} />
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
                                        <Button variant="ghost" className="gap-2 px-3">
                                            <Avatar size="sm">
                                                <AvatarFallback>{userInitials}</AvatarFallback>
                                            </Avatar>
                                            <span className="hidden lg:inline">{user.name || "用户"}</span>
                                            {!user.emailVerification && (
                                                <Shadcn.Badge variant="destructive" className="gap-1">
                                                    <MailWarningIcon />
                                                    未验证
                                                </Shadcn.Badge>
                                            )}
                                        </Button>
                                    </Shadcn.DropdownMenuTrigger>
                                    <Shadcn.DropdownMenuContent align="end" className="w-64">
                                        <Shadcn.DropdownMenuLabel className="space-y-0.5">
                                            <div className="flex gap-1 truncate text-sm font-medium">
                                                {user.name || "用户"}
                                                {user.labels.includes("admin") && (
                                                    <Shadcn.Badge variant="outline" className="gap-1">
                                                        <ShieldUserIcon className="h-3 w-3" />
                                                        管理员
                                                    </Shadcn.Badge>
                                                )}
                                                {user.labels.includes("premium") && (
                                                    <Shadcn.Badge variant="outline" className="gap-1">
                                                        <SparklesIcon className="h-3 w-3" />
                                                        高级会员
                                                    </Shadcn.Badge>
                                                )}
                                            </div>
                                            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                                        </Shadcn.DropdownMenuLabel>
                                        {!user.emailVerification && (
                                            <>
                                                <Shadcn.DropdownMenuSeparator />
                                                <div className="px-2 py-1.5">
                                                    <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
                                                        {/* 标题行 */}
                                                        <div className="flex items-start gap-2">
                                                            <MailWarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                                                    验证邮箱
                                                                </p>
                                                                <p className="mt-1 text-xs leading-relaxed text-amber-700/80 dark:text-amber-400/80">
                                                                    请验证您的邮箱地址以解锁全部功能
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* 重新发送按钮 */}
                                                        <Shadcn.Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-3 w-full border-amber-500/50 bg-amber-500/5 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
                                                            onClick={handleResendVerification}
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

                                                        {/* 错误提示 */}
                                                        {verificationNotice === "failed" && (
                                                            <p className="mt-2 text-center text-xs text-destructive">发送失败，请重试</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        <Shadcn.DropdownMenuSeparator />
                                        <Shadcn.DropdownMenuItem variant="destructive" onClick={handleLogout}>
                                            <LogOutIcon />
                                            退出登录
                                        </Shadcn.DropdownMenuItem>
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
                                                <UserKeyIcon className="size-3.5" strokeWidth={2} />
                                                登录
                                            </Link>
                                        </Shadcn.NavigationMenuLink>
                                    </Shadcn.NavigationMenuItem>
                                    <Shadcn.NavigationMenuItem>
                                        <Shadcn.NavigationMenuLink asChild>
                                            <Link
                                                href="/auth/register"
                                                className={cn(
                                                    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                                                    "hover:bg-accent hover:text-accent-foreground",
                                                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                                                    "disabled:pointer-events-none disabled:opacity-50"
                                                )}>
                                                <UserPlusIcon className="size-3.5" strokeWidth={2} />
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
                            <Button variant="ghost" size="icon">
                                <MenuIcon />
                            </Button>
                        </Shadcn.DropdownMenuTrigger>
                        <Shadcn.DropdownMenuContent align="end">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Shadcn.DropdownMenuItem key={item.href} asChild>
                                        <Link href={item.href}>
                                            <Icon />
                                            {item.label}
                                        </Link>
                                    </Shadcn.DropdownMenuItem>
                                );
                            })}
                            <Shadcn.DropdownMenuSeparator />
                            {user ? (
                                <>
                                    <Shadcn.DropdownMenuLabel className="space-y-0.5 px-2 py-1.5">
                                        <div className="flex items-center gap-2">
                                            <Avatar size="sm">
                                                <AvatarFallback>{userInitials}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex gap-1 truncate text-sm font-medium">{user.name || "用户"}</div>
                                                <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                        {!user.emailVerification && (
                                            <Shadcn.Badge variant="destructive" className="mt-2 w-full gap-1">
                                                <MailWarningIcon className="h-3 w-3" />
                                                邮箱未验证
                                            </Shadcn.Badge>
                                        )}
                                    </Shadcn.DropdownMenuLabel>
                                    <Shadcn.DropdownMenuSeparator />
                                    {!user.emailVerification && (
                                        <>
                                            <div className="px-2 py-1.5">
                                                <Shadcn.Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={handleResendVerification}
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
                                                {verificationNotice === "failed" && (
                                                    <p className="mt-1 text-center text-xs text-destructive">发送失败</p>
                                                )}
                                            </div>
                                            <Shadcn.DropdownMenuSeparator />
                                        </>
                                    )}
                                    <Shadcn.DropdownMenuItem variant="destructive" onClick={handleLogout}>
                                        <LogOutIcon className="h-4 w-4" />
                                        退出登录
                                    </Shadcn.DropdownMenuItem>
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
                                        <Link href="/auth/register">
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
