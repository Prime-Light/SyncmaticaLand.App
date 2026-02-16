"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stone, Home, Box, FileCode, Heart, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const navItems = [
    { name: "首页", href: "/", icon: Home },
    { name: "原理图", href: "/schematics", icon: Box },
    { name: "关于我们", href: "/about", icon: Users },
    { name: "API Docs", href: "/api-docs", icon: FileCode },
    { name: "赞助", href: "/sponsor", icon: Heart },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-14 max-w-screen-2xl items-center">
                {/* Logo */}
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Stone className="h-6 w-6" />
                    <div className="hidden sm:flex flex-col leading-none">
                        <span className="font-bold text-sm tracking-tight">SyncmaticaLand</span>
                        <span className="text-[10px] text-muted-foreground">投影共和国</span>
                    </div>
                </Link>

                {/* 导航部分 */}
                <nav className="flex flex-1 items-center justify-end space-x-1 md:space-x-2">
                    {/* 主要导航项 */}
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Button
                                key={item.href}
                                variant="ghost"
                                size="default"
                                className={cn(
                                    "inline-flex items-center justify-center rounded-md px-2 sm:px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                                    isActive
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                                asChild>
                                <Link href={item.href} title={item.name}>
                                    <Icon className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">{item.name}</span>
                                </Link>
                            </Button>
                        );
                    })}
                </nav>

                {/* 右侧 - Theme Toggle */}
                <div className="flex items-center ml-2">
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
