"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Stone,
    Home,
    Box,
    Book,
    LogIn,
    UserPlus,
    Sparkles,
    ShieldUser,
    LogOut,
    MailWarning,
    MailCheck,
    Loader2,
    LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction, resendEmailVerificationAction } from "@/lib/auth/session";
import { Radix, PrimeLight } from "@/components";
import { Avatar, AvatarFallback } from "@/components/@radix-ui/avatar";
import { Button } from "@/components/@radix-ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/@radix-ui/dropdown-menu";
import { useTranslations } from "next-intl";

const navItems = [
    { key: "Home", href: "/", icon: Home },
    { key: "Schematics", href: "/schematics", icon: Box },
    { key: "Docs", href: "/docs", icon: Book },
];

const accountItems = [
    { key: "Login", href: "/auth/login", icon: LogIn },
    { key: "SignUp", href: "/auth/signup", icon: UserPlus },
];

interface CurrentUser {
    id: string;
    name: string;
    email: string;
    emailVerification: boolean;
    labels: string[];
}

export function Navbar() {
    const pathname = usePathname();
    const t = useTranslations("Navbar");
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [verificationNotice, setVerificationNotice] = useState<"" | "sent" | "failed">("");
    const [isResending, setIsResending] = useState(false);
    const [, startTransition] = useTransition();
    const navButtonClass =
        "inline-flex items-center justify-center rounded-md px-2 sm:px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:bg-accent hover:text-accent-foreground";

    useEffect(() => {
        let mounted = true;

        fetch("/api/auth/me", { method: "GET", cache: "no-store" })
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

    const segments = pathname.split("/").filter(Boolean);
    const normalizedPath = segments.length > 1 ? `/${segments.slice(1).join("/")}` : "/";
    const isDashboardRoute = normalizedPath === "/dashboard" || normalizedPath.startsWith("/dashboard/");

    if (isDashboardRoute) {
        return null;
    }

    return (
        <header className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
            <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Stone className="h-6 w-6" />
                    <div className="hidden flex-col leading-none sm:flex">
                        <span className="text-sm font-bold tracking-tight">SyncmaticaLand</span>
                        <span className="text-muted-foreground text-[10px]">{t("LogoSubtitle")}</span>
                    </div>
                </Link>

                {/* 导航部分 */}
                <nav className="flex flex-1 items-center justify-end space-x-1 md:space-x-2">
                    {/* 主要导航项 */}
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.href === "/" ? pathname.split("/").length === 2 : pathname.includes(item.href);
                        const name = t(item.key);

                        return (
                            <Button
                                key={item.href}
                                variant="ghost"
                                size="default"
                                className={cn(
                                    "focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:px-3",
                                    isActive
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                                asChild>
                                <Link href={item.href} title={name}>
                                    <Icon className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">{name}</span>
                                </Link>
                            </Button>
                        );
                    })}
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="default" className={navButtonClass}>
                                    <Avatar size="sm">
                                        <AvatarFallback>{userInitials}</AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:inline">{user.name || t("User")}</span>
                                    {!user.emailVerification && (
                                        <Radix.Badge variant="destructive" className="gap-1">
                                            <MailWarning className="h-3 w-3" />
                                            {t("Unverified")}
                                        </Radix.Badge>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuLabel className="space-y-0.5">
                                    <div className="flex gap-1 truncate text-sm font-medium">
                                        {user.name || t("User")}
                                        {user.labels.includes("admin") && (
                                            <Radix.Badge variant="orange">
                                                <ShieldUser className="h-3 w-3" />
                                                {t("Admin")}
                                            </Radix.Badge>
                                        )}
                                        {user.labels.includes("premium") && (
                                            <Radix.Badge variant="purple">
                                                <Sparkles className="h-3 w-3" />
                                                {t("Premium")}
                                            </Radix.Badge>
                                        )}
                                    </div>
                                    <div className="text-muted-foreground truncate text-xs">{user.email}</div>
                                </DropdownMenuLabel>
                                {!user.emailVerification && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <div className="px-2 py-1.5">
                                            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
                                                {/* 标题行 */}
                                                <div className="flex items-start gap-2">
                                                    <MailWarning className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                                            {t("VerifyEmail.Title")}
                                                        </p>
                                                        <p className="mt-1 text-xs leading-relaxed text-amber-700/80 dark:text-amber-400/80">
                                                            {t("VerifyEmail.Description")}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* 重新发送按钮 */}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-3 w-full border-amber-500/50 bg-amber-500/5 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
                                                    onClick={handleResendVerification}
                                                    disabled={isResending || verificationNotice === "sent"}>
                                                    {isResending ? (
                                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                    ) : verificationNotice === "sent" ? (
                                                        <MailCheck className="mr-1.5 h-3.5 w-3.5" />
                                                    ) : (
                                                        <MailWarning className="mr-1.5 h-3.5 w-3.5" />
                                                    )}
                                                    {verificationNotice === "sent"
                                                        ? t("VerifyEmail.ResendSuccess")
                                                        : t("VerifyEmail.ResendButton")}
                                                </Button>

                                                {/* 错误提示 */}
                                                {verificationNotice === "failed" && (
                                                    <p className="text-destructive mt-2 text-center text-xs">{t("VerifyEmail.ResendFailed")}</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard">
                                        <LayoutDashboard className="h-4 w-4" />
                                        {t("Dashboard")}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4" />
                                    {t("Logout")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        accountItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.href === "/" ? pathname.split("/").length === 2 : pathname.includes(item.href);
                            const name = t(item.key);

                            return (
                                <Button
                                    key={item.href}
                                    variant="ghost"
                                    size="default"
                                    className={cn(navButtonClass, isActive && "bg-accent text-accent-foreground")}
                                    asChild>
                                    <Link href={item.href} title={name}>
                                        <Icon className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">{name}</span>
                                    </Link>
                                </Button>
                            );
                        })
                    )}
                </nav>

                {/* 右侧 - Theme Toggle */}
                <div className="ml-2 flex items-center">
                    <PrimeLight.ThemeToggle />
                </div>
            </div>
        </header>
    );
}
