"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CodeIcon, Grid3X3Icon, HomeIcon, MenuIcon, StoneIcon, UserKeyIcon, UserPlusIcon } from "lucide-react";
import { Prime, Shadcn } from "@/components";
import { cn } from "@/lib/utils";

interface NavbarProps {
    className?: string;
}

const navItems = [
    { label: "首页", href: "/", icon: HomeIcon },
    { label: "原理图", href: "/schematics", icon: Grid3X3Icon },
    { label: "API 文档", href: "/docs", icon: CodeIcon },
];

export function Navbar({ className }: NavbarProps) {
    const pathname = usePathname();

    return (
        <header
            className={cn(
                "fixed top-0 z-500 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
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
                                const isActive = item.href === "/" ? pathname.split("/").length === 2 : pathname.includes(item.href);
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
                        </Shadcn.NavigationMenuList>
                        <Shadcn.Separator className="mx-4 my-auto h-3/4" orientation="vertical" />
                        <Prime.ThemeToggle />
                    </Shadcn.NavigationMenu>
                </div>

                {/* 移动端：下拉菜单 */}
                <div className="md:hidden">
                    <Shadcn.DropdownMenu>
                        <Shadcn.DropdownMenuTrigger asChild>
                            <button
                                className={cn(
                                    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                                    "disabled:pointer-events-none disabled:opacity-50"
                                )}>
                                <MenuIcon className="size-4" strokeWidth={2} />
                            </button>
                        </Shadcn.DropdownMenuTrigger>
                        <Shadcn.DropdownMenuContent
                            className="w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none"
                            align="end">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Shadcn.DropdownMenuItem key={item.href} asChild>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
                                                "hover:bg-accent hover:text-accent-foreground",
                                                "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                                            )}>
                                            <Icon className="size-4" strokeWidth={2} />
                                            {item.label}
                                        </Link>
                                    </Shadcn.DropdownMenuItem>
                                );
                            })}
                            <Shadcn.Separator className="mx-auto my-2 w-3/4" />
                            <Shadcn.DropdownMenuItem asChild>
                                <Link
                                    href="/auth/login"
                                    className={cn(
                                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                                    )}>
                                    <UserKeyIcon className="size-3.5" strokeWidth={2} />
                                    登录
                                </Link>
                            </Shadcn.DropdownMenuItem>
                            <Shadcn.DropdownMenuItem asChild>
                                <Link
                                    href="/auth/register"
                                    className={cn(
                                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                                    )}>
                                    <UserPlusIcon className="size-3.5" strokeWidth={2} />
                                    注册
                                </Link>
                            </Shadcn.DropdownMenuItem>
                        </Shadcn.DropdownMenuContent>
                    </Shadcn.DropdownMenu>
                </div>
            </div>
        </header>
    );
}
