"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/@radix-ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/@radix-ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/@radix-ui/dropdown-menu";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/@radix-ui/field";
import { Input } from "@/components/@radix-ui/input";
import { loginAction } from "@/lib/auth/login";
import { AlertCircle, CheckCircle2, ChevronDown, Stone } from "lucide-react";
import { useTranslations } from "next-intl";
import { LogosMicrosoftIcon, LogosGoogleIcon, LogosGithubIcon, LogosDiscordIcon } from "@/components";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const t = useTranslations("Pages.Auth.Login");
    type LoginActionState = Awaited<ReturnType<typeof loginAction>>;
    const initialState: LoginActionState = { success: false, messageKey: "" };
    const [state, formAction, isPending] = useActionState(loginAction, initialState);
    const [countdown, setCountdown] = useState(1);
    const tx = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
    const messageTextByKey: Record<Exclude<LoginActionState["messageKey"], "">, string> = {
        missing_fields: tx("Action.MissingFields", "Please fill in email and password."),
        login_success: tx("Action.LoginSuccess", "Login successful."),
        login_failed: tx("Action.LoginFailed", "Login failed. Please try again."),
    };
    const messageText = state.messageKey ? messageTextByKey[state.messageKey] : "";

    useEffect(() => {
        if (!state.success) return;
        
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.assign("/");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [state.success]);

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form action={formAction}>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <a href="#" className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex size-8 items-center justify-center rounded-md">
                                <Stone className="size-6" />
                            </div>
                        </a>
                        <h1 className="text-xl font-bold">{t("Title")}</h1>
                        <FieldDescription>
                            {t("NoAccount")} <Link href="/auth/signup">{t("SignUp")}</Link>
                        </FieldDescription>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="email">{t("Email")}</FieldLabel>
                        <Input id="email" name="email" type="email" placeholder="me@example.com" required />
                    </Field>
                    <Field>
                        <div className="flex items-center justify-between">
                            <FieldLabel htmlFor="password">{t("Password")}</FieldLabel>
                            <Link href="/auth/recover" className="text-muted-foreground text-sm underline-offset-4 hover:underline">
                                {t("ForgotPassword")}
                            </Link>
                        </div>
                        <Input id="password" name="password" type="password" autoComplete="current-password" required />
                    </Field>
                    {messageText ? (
                        <Alert
                            variant={state.success ? "default" : "destructive"}
                            className={state.success ? "border-green-500/50 text-green-600" : ""}>
                            {state.success ? <CheckCircle2 /> : <AlertCircle />}
                            <AlertTitle>{state.success ? tx("AlertSuccessTitle", "Success") : tx("AlertErrorTitle", "Error")}</AlertTitle>
                            <AlertDescription className={state.success ? "text-green-600/90" : ""}>
                                {messageText}
                                {state.success && (
                                    <span className="ml-1">({t("RedirectingIn", { countdown })})</span>
                                )}
                            </AlertDescription>
                        </Alert>
                    ) : null}
                    <Field>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? tx("Submitting", "Logging in...") : t("Login")}
                        </Button>
                    </Field>
                    <FieldSeparator>{t("Or")}</FieldSeparator>
                    <Field className="grid gap-4 sm:grid-cols-2">
                        <Button variant="outline" type="button">
                            <LogosMicrosoftIcon className="size-4" />
                            <span className="translate-y-px">{t("LoginWithMicrosoft")}</span>
                        </Button>
                        <Button variant="outline" type="button">
                            <LogosGoogleIcon className="size-4" />
                            <span className="translate-y-px">{t("LoginWithGoogle")}</span>
                        </Button>
                    </Field>
                    <Field className="items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" type="button" className="w-full justify-center gap-2">
                                    <span>{t("MoreLoginMethods")}</span>
                                    <ChevronDown className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center">
                                <DropdownMenuItem className="justify-center gap-2 text-center">
                                    <LogosGithubIcon className="size-4" />
                                    <span className="translate-y-px">{t("LoginWithGithub")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="justify-center gap-2 text-center">
                                    <LogosDiscordIcon className="size-4" />
                                    <span className="translate-y-px">{t("LoginWithDiscord")}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Field>
                </FieldGroup>
            </form>
            <FieldDescription className="px-6 text-center">
                {t("ByClickingContinue")} <Link href="/docs/terms-of-service">{t("TermsOfService")}</Link> {t("And")}{" "}
                <Link href="/docs/privacy-policy">{t("PrivacyPolicy")}</Link>
            </FieldDescription>
        </div>
    );
}
