"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stone, Home, Box, Book, LogIn, UserPlus, Sparkles, ShieldUser, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction, resendEmailVerificationAction } from "@/lib/auth/session";
import { Badge, ThemeToggle } from "@/components";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    const tx = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [verificationNotice, setVerificationNotice] = useState<"" | "sent" | "failed">("");
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
        const parts = seed.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return seed.slice(0, 2).toUpperCase();
    }, [user]);

    const handleLogout = () => {
        startTransition(async () => {
            await logoutAction();
            window.location.assign("/");
        });
    };

    const handleResendVerification = () => {
        startTransition(async () => {
            const result = await resendEmailVerificationAction();
            setVerificationNotice(result.success ? "sent" : "failed");
        });
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-14 max-w-screen-2xl items-center">
                {/* Logo */}
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Stone className="h-6 w-6" />
                    <div className="hidden sm:flex flex-col leading-none">
                        <span className="font-bold text-sm tracking-tight">SyncmaticaLand</span>
                        <span className="text-[10px] text-muted-foreground">{t("LogoSubtitle")}</span>
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
                                    "inline-flex items-center justify-center rounded-md px-2 sm:px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
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
                                    <span className="hidden sm:inline">{user.name || tx("User", "User")}</span>
                                    <Badge variant="destructive" className={cn(user.emailVerification && "hidden")}>
                                        Unverified
                                    </Badge>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="space-y-0.5">
                                    <div className="truncate text-sm font-medium flex gap-1">
                                        {user.name || tx("User", "User")}
                                        <Badge variant="orange" className={cn(!user.labels.includes("admin") && "hidden")}>
                                            <ShieldUser />
                                            Admin
                                        </Badge>
                                        <Badge variant="purple" className={cn(!user.labels.includes("premium") && "hidden")}>
                                            <Sparkles />
                                            Premium
                                        </Badge>
                                    </div>
                                    <div className="text-muted-foreground truncate text-xs">{user.email}</div>
                                </DropdownMenuLabel>
                                {!user.emailVerification ? (
                                    <>
                                        <DropdownMenuSeparator />
                                        <Alert>
                                            <AlertTitle>{tx("VerifyEmailTitle", "Please verify your email")}</AlertTitle>
                                            <AlertDescription>
                                                <div>{tx("VerifyEmailDesc", "Your account is active, but email is not verified.")}</div>
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    className="h-auto p-0 text-xs"
                                                    onClick={handleResendVerification}>
                                                    {tx("ResendVerifyEmail", "Resend verification email")}
                                                </Button>
                                                {verificationNotice === "sent" ? (
                                                    <div className="text-green-700">{tx("VerifyEmailSent", "Verification email sent.")}</div>
                                                ) : null}
                                                {verificationNotice === "failed" ? (
                                                    <div className="text-destructive">
                                                        {tx("VerifyEmailSendFailed", "Failed to send verification email.")}
                                                    </div>
                                                ) : null}
                                            </AlertDescription>
                                        </Alert>
                                    </>
                                ) : null}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                                    <LogOut />
                                    {tx("Logout", "Logout")}
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
                <div className="flex items-center ml-2">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
