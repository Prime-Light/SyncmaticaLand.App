"use client";

import * as React from "react";
import { MonitorCog, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const t = useTranslations("ThemeToggle");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Sun className={`absolute h-[1.2rem] w-[1.2rem] opacity-0 transition-all ${theme === "light" ? "opacity-100" : ""}`} />
                    <Moon className={`absolute h-[1.2rem] w-[1.2rem] opacity-0 transition-all ${theme === "dark" ? "opacity-100" : ""}`} />
                    <MonitorCog
                        className={`absolute h-[1.2rem] w-[1.2rem] opacity-0 transition-all ${theme === "system" ? "opacity-100" : ""}`}
                    />
                    <span className="sr-only">{t("AriaLabel")}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")} className={theme === "light" ? "bg-accent text-accent-foreground" : ""}>
                    {t("Light")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className={theme === "dark" ? "bg-accent text-accent-foreground" : ""}>
                    {t("Dark")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className={theme === "system" ? "bg-accent text-accent-foreground" : ""}>
                    {t("System")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
