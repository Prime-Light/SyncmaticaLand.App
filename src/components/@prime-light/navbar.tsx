"use client"

import Link from "next/link"
import { Code, Grid3X3, Home, Stone } from "lucide-react"
import { Radix } from "@/components"
import { cn } from "@/lib/utils"

interface NavbarProps {
    className?: string
}

const navItems = [
    { label: "首页", href: "/", icon: Home },
    { label: "原理图", href: "/schematics", icon: Grid3X3 },
    { label: "API 文档", href: "/docs", icon: Code },
]

export function Navbar({ className }: NavbarProps) {
    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
                className
            )}>
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6">
                {/* 左侧：Logo 和标题 */}
                <Link href="/" className="flex items-center gap-1.5">
                    {/* 黑白风格的 Stone 图标 */}
                    <div className="flex size-9 items-center justify-center">
                        <Stone className="size-6 text-foreground" strokeWidth={1.5} />
                    </div>
                    {/* 叠在一起的标题 */}
                    <div className="flex flex-col">
                        <span className="text-sm leading-tight font-semibold tracking-tight">SyncmaticaLand</span>
                        <span className="text-xs leading-tight font-medium text-muted-foreground">投影共和国</span>
                    </div>
                </Link>

                {/* 右侧：导航菜单 */}
                <Radix.NavigationMenu>
                    <Radix.NavigationMenuList className="gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <Radix.NavigationMenuItem key={item.href}>
                                    <Radix.NavigationMenuLink asChild>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                                                "hover:bg-accent hover:text-accent-foreground",
                                                "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                                                "disabled:pointer-events-none disabled:opacity-50"
                                            )}>
                                            <Icon className="size-3.5" strokeWidth={2} />
                                            {item.label}
                                        </Link>
                                    </Radix.NavigationMenuLink>
                                </Radix.NavigationMenuItem>
                            )
                        })}
                    </Radix.NavigationMenuList>
                </Radix.NavigationMenu>
            </div>
        </header>
    )
}
