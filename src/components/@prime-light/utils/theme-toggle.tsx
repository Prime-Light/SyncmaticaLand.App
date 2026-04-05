"use client";

import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import { Shadcn } from "../..";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();

    return (
        <Shadcn.DropdownMenu>
            <Shadcn.DropdownMenuTrigger asChild>
                <Shadcn.Button variant="outline" size="icon">
                    <SunIcon
                        suppressHydrationWarning
                        className="absolute size-[1.2rem] transition-all dark:opacity-0"
                    />
                    <MoonIcon
                        suppressHydrationWarning
                        className="absolute size-[1.2rem] opacity-0 transition-all dark:opacity-100"
                    />
                    <span className="sr-only">{"切换主题"}</span>
                </Shadcn.Button>
            </Shadcn.DropdownMenuTrigger>
            <Shadcn.DropdownMenuContent align="end">
                <Shadcn.DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={theme === "light" ? "bg-accent text-accent-foreground" : ""}>
                    {"浅色主题"}
                </Shadcn.DropdownMenuItem>
                <Shadcn.DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={theme === "dark" ? "bg-accent text-accent-foreground" : ""}>
                    {"深色主题"}
                </Shadcn.DropdownMenuItem>
                <Shadcn.DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={theme === "system" ? "bg-accent text-accent-foreground" : ""}>
                    {"跟随系统"}
                </Shadcn.DropdownMenuItem>
            </Shadcn.DropdownMenuContent>
        </Shadcn.DropdownMenu>
    );
}
