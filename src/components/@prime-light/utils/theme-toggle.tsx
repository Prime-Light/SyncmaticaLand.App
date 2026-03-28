"use client";

import { useTheme } from "next-themes";
import { MonitorCogIcon, MoonIcon, SunIcon } from "lucide-react";
import { Shadcn } from "../..";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();

    return (
        <Shadcn.DropdownMenu>
            <Shadcn.DropdownMenuTrigger asChild>
                <Shadcn.Button variant="outline" size="icon">
                    {theme === "light" && <SunIcon className="absolute size-[1.2rem] transition-all" />}
                    {theme === "dark" && <MoonIcon className="absolute size-[1.2rem] transition-all" />}
                    {theme === "system" && <MonitorCogIcon className="absolute size-[1.2rem] translate-x-px transition-all" />}
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
