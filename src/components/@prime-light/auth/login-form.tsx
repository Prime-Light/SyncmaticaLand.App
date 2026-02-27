"use client";

import { cn } from "@/lib/utils";
import { PrimeLight, Radix } from "@/components";
import { LogosMicrosoftIcon, LogosGoogleIcon, LogosGithubIcon, LogosDiscordIcon } from "@/components/icons";
import { loginAction } from "@/lib/auth/login";
import { AlertCircle, CheckCircle2, ChevronDown, Stone } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const t = useTranslations("Pages.Auth.Login");
    type LoginActionState = Awaited<ReturnType<typeof loginAction>>;
    const initialState: LoginActionState = { success: false, messageKey: "" };
    const [state, formAction, isPending] = useActionState(loginAction, initialState);
    const [countdown, setCountdown] = useState(1);
    const [captchaSolved, setCaptchaSolved] = useState(false);
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
                <Radix.FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <a href="#" className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex size-8 items-center justify-center rounded-md">
                                <Stone className="size-6" />
                            </div>
                        </a>
                        <h1 className="text-xl font-bold">{t("Title")}</h1>
                        <Radix.FieldDescription>
                            {t("NoAccount")} <Link href="/auth/signup">{t("SignUp")}</Link>
                        </Radix.FieldDescription>
                    </div>
                    <Radix.Field>
                        <Radix.FieldLabel htmlFor="email">{t("Email")}</Radix.FieldLabel>
                        <Radix.Input id="email" name="email" type="email" placeholder="me@example.com" required />
                    </Radix.Field>
                    <Radix.Field>
                        <div className="flex items-center justify-between">
                            <Radix.FieldLabel htmlFor="password">{t("Password")}</Radix.FieldLabel>
                            <Link href="/auth/recover" className="text-muted-foreground text-sm underline-offset-4 hover:underline">
                                {t("ForgotPassword")}
                            </Link>
                        </div>
                        <Radix.Input id="password" name="password" type="password" autoComplete="current-password" required />
                    </Radix.Field>
                    <Radix.Field>
                        <Radix.FieldLabel htmlFor="cap">{t("Captcha")}</Radix.FieldLabel>
                        <PrimeLight.Captcha onSolve={setCaptchaSolved} />
                    </Radix.Field>
                    {messageText ? (
                        <Radix.Alert
                            variant={state.success ? "default" : "destructive"}
                            className={state.success ? "border-green-500/50 text-green-600" : ""}>
                            {state.success ? <CheckCircle2 /> : <AlertCircle />}
                            <Radix.AlertTitle>
                                {state.success ? tx("AlertSuccessTitle", "Success") : tx("AlertErrorTitle", "Error")}
                            </Radix.AlertTitle>
                            <Radix.AlertDescription className={state.success ? "text-green-600/90" : ""}>
                                {messageText}
                                {state.success && <span className="ml-1">({t("RedirectingIn", { countdown })})</span>}
                            </Radix.AlertDescription>
                        </Radix.Alert>
                    ) : null}
                    <Radix.Field>
                        <Radix.Button type="submit" disabled={isPending || !captchaSolved}>
                            {isPending ? tx("Submitting", "Logging in...") : t("Login")}
                        </Radix.Button>
                    </Radix.Field>
                    <Radix.FieldSeparator>{t("Or")}</Radix.FieldSeparator>
                    <Radix.Field className="grid gap-4 sm:grid-cols-2">
                        <Radix.Button variant="outline" type="button">
                            <LogosMicrosoftIcon className="size-4" />
                            <span className="translate-y-px">{t("LoginWithMicrosoft")}</span>
                        </Radix.Button>
                        <Radix.Button variant="outline" type="button">
                            <LogosGoogleIcon className="size-4" />
                            <span className="translate-y-px">{t("LoginWithGoogle")}</span>
                        </Radix.Button>
                    </Radix.Field>
                    <Radix.Field className="items-center">
                        <Radix.DropdownMenu>
                            <Radix.DropdownMenuTrigger asChild>
                                <Radix.Button variant="outline" type="button" className="w-full justify-center gap-2">
                                    <span>{t("MoreLoginMethods")}</span>
                                    <ChevronDown className="size-4" />
                                </Radix.Button>
                            </Radix.DropdownMenuTrigger>
                            <Radix.DropdownMenuContent align="center">
                                <Radix.DropdownMenuItem className="justify-center gap-2 text-center">
                                    <LogosGithubIcon className="size-4" />
                                    <span className="translate-y-px">{t("LoginWithGithub")}</span>
                                </Radix.DropdownMenuItem>
                                <Radix.DropdownMenuItem className="justify-center gap-2 text-center">
                                    <LogosDiscordIcon className="size-4" />
                                    <span className="translate-y-px">{t("LoginWithDiscord")}</span>
                                </Radix.DropdownMenuItem>
                            </Radix.DropdownMenuContent>
                        </Radix.DropdownMenu>
                    </Radix.Field>
                </Radix.FieldGroup>
            </form>
            <Radix.FieldDescription className="px-6 text-center">
                {t("ByClickingContinue")} <Link href="/docs/terms-of-service">{t("TermsOfService")}</Link> {t("And")}{" "}
                <Link href="/docs/privacy-policy">{t("PrivacyPolicy")}</Link>
            </Radix.FieldDescription>
        </div>
    );
}
