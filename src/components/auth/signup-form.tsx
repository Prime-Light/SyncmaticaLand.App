"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Stone } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
    const t = useTranslations("Pages.Auth.Signup");

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form>
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
                        <FieldLabel htmlFor="email">{t("Email")}</FieldLabel>
                        <Input id="email" type="email" placeholder="me@example.com" required />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">{t("Password")}</FieldLabel>
                        <Input id="password" type="password" required />
                    </Field>
                    <Field>
                        <Button type="submit">{t("SignUp")}</Button>
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
