"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

import { Button } from "@/components/@radix-ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/@radix-ui/dropdown-menu";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const t = useTranslations("ThemeToggle");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Sun className={`absolute h-[1.2rem] w-[1.2rem] opacity-100 transition-all dark:opacity-0`} />
                    <Moon className={`absolute h-[1.2rem] w-[1.2rem] opacity-0 transition-all dark:opacity-100`} />
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
