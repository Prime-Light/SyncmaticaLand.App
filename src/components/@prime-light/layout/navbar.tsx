"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    SparklesIcon,
    ShieldUserIcon,
} from "lucide-react";
import { Prime, Shadcn } from "@/components";
import { cn } from "@/lib/utils";
import { Auth, WrapSchema } from "@/schema";

interface NavbarProps {
    className?: string;
    initialUser: Auth.Me.Me.Res["user"] | null;
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

// 导航栏组件
export function Navbar({ initialUser, className }: NavbarProps) {
    const $pathname = usePathname();
    const $router = useRouter();

    const [user, setUser] = useState<Auth.Me.Me.Res["user"] | null>(initialUser);
    const [, startTransition] = useTransition();

    useEffect(() => {
        let mounted = true;

        console.debug("fetch");
        fetch("/api/v1/auth/me", { method: "GET", cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) return null;
                console.debug("got user");
                return (await res.json()) as WrapSchema<Auth.Me.Me.Res>;
            })
            .then((data) => {
                if (!mounted) return;
                // ***烦死了这是什么东西，这很安全，ESLint 和 TS 一棒子打飞！
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setUser((data as any).data.user ?? null);
            })
            .catch(() => {
                if (!mounted) return;
                console.debug("err!");
                setUser(null);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const userInitials = useMemo(() => {
        const seed = user?.display_name?.trim() || user?.email?.trim() || "";
        if (!seed) return "U";
        return seed[0].toUpperCase();
    }, [user]);

    async function logoutAction() {
        await fetch("/api/v1/auth/logout", { method: "POST", cache: "no-store" });
    }

    const handleLogout = () => {
        startTransition(async () => {
            await logoutAction();
            setUser(null);
            $router.refresh();
            $router.push("/");
        });
    };

    return (
        <header
            className={cn(
                "sticky top-0 z-50 h-14 max-h-14 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
                className
            )}>
            <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6">
                {/* 左侧：Logo 和标题 */}
                <Link href="/" className="flex items-center gap-1.5">
                    <div className="flex size-9 items-center justify-center">
                        <StoneIcon className="size-6 text-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm leading-tight font-semibold tracking-tight">
                            SyncmaticaLand
                        </span>
                        <span className="text-xs leading-tight font-medium text-muted-foreground">
                            投影共和国
                        </span>
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
                                        ? $pathname === "/"
                                        : $pathname.startsWith(item.href);
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
                        <Shadcn.Separator
                            className="mx-4 my-auto h-3/4"
                            orientation="vertical"
                        />
                        <Shadcn.NavigationMenuList className="gap-1">
                            {user ? (
                                <Shadcn.DropdownMenu>
                                    <Shadcn.DropdownMenuTrigger asChild>
                                        <Shadcn.Button
                                            variant="ghost"
                                            size="lg"
                                            className="gap-2 px-3">
                                            <Shadcn.Avatar size="sm">
                                                <Shadcn.AvatarImage src={user.avatar_url} />
                                                <Shadcn.AvatarFallback>
                                                    {userInitials}
                                                </Shadcn.AvatarFallback>
                                            </Shadcn.Avatar>
                                            <span className="hidden lg:inline">
                                                {user.display_name || "用户"}
                                            </span>
                                        </Shadcn.Button>
                                    </Shadcn.DropdownMenuTrigger>
                                    <Shadcn.DropdownMenuContent align="end" className="w-64">
                                        <UserMenuHeader
                                            user={user}
                                            userInitials={userInitials}
                                        />
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
                                                href="/auth/register"
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
                        <Shadcn.Separator
                            className="mx-4 my-auto h-3/4"
                            orientation="vertical"
                        />
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
                                    const isActive =
                                        item.href === "/"
                                            ? $pathname === "/"
                                            : $pathname.startsWith(item.href);
                                    return (
                                        <Shadcn.DropdownMenuItem key={item.href} asChild>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    isActive &&
                                                        "bg-accent text-accent-foreground"
                                                )}>
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
