"use client";

import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle, Button, Captcha, Field, FieldDescription, FieldGroup, FieldLabel, Input } from "@/components";
import { signupAction, type SignupActionState } from "@/lib/auth/signup";
import { AlertCircle, CheckCircle2, Stone } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
    const t = useTranslations("Pages.Auth.Signup");
    const initialState: SignupActionState = { success: false, messageKey: "" };
    const [state, formAction, isPending] = useActionState(signupAction, initialState);
    const [captchaSolved, setCaptchaSolved] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const tx = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
    const messageTextByKey: Record<Exclude<SignupActionState["messageKey"], "">, string> = {
        missing_fields: tx("Action.MissingFields", "Please fill in name, email, and password."),
        signup_success: tx("Action.SignupSuccess", "Signup successful. Please log in."),
        signup_failed: tx("Action.SignupFailed", "Signup failed. Please try again."),
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
                            {t("AlreadyHaveAccount")} <Link href="/auth/login">{t("Login")}</Link>
                        </FieldDescription>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="name">{tx("Name", "Name")}</FieldLabel>
                        <Input id="name" name="name" type="text" placeholder={tx("NamePlaceholder", "Your name")} required />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="email">{t("Email")}</FieldLabel>
                        <Input id="email" name="email" type="email" placeholder="me@example.com" required />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">{t("Password")}</FieldLabel>
                        <Input id="password" name="password" type="password" required />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="captcha">{t("Captcha")}</FieldLabel>
                        <Captcha onSolve={setCaptchaSolved} />
                    </Field>
                    {messageText ? (
                        <Alert
                            variant={state.success ? "default" : "destructive"}
                            className={state.success ? "border-green-500/50 text-green-700" : ""}>
                            {state.success ? <CheckCircle2 /> : <AlertCircle />}
                            <AlertTitle>{state.success ? tx("AlertSuccessTitle", "Success") : tx("AlertErrorTitle", "Error")}</AlertTitle>
                            <AlertDescription className={state.success ? "text-green-700/90" : ""}>
                                {messageText}
                                {state.success && <span className="ml-1">({t("RedirectingIn", { countdown })})</span>}
                            </AlertDescription>
                        </Alert>
                    ) : null}
                    <Field>
                        <Button type="submit" disabled={isPending || !captchaSolved}>
                            {isPending ? tx("Submitting", "Signing up...") : t("SignUp")}
                        </Button>
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
