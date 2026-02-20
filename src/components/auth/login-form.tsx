"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ChevronDown, Stone } from "lucide-react";
import { useTranslations } from "next-intl";
import { LogosMicrosoftIcon, LogosGoogleIcon, LogosGithubIcon, LogosDiscordIcon } from "@/components";
import Link from "next/link";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const t = useTranslations("Pages.Auth.Login");

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
                            {t("NoAccount")} <Link href="/auth/signup">{t("SignUp")}</Link>
                        </FieldDescription>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="email">{t("Email")}</FieldLabel>
                        <Input id="email" type="email" placeholder="me@example.com" required />
                    </Field>
                    <Field>
                        <div className="flex items-center justify-between">
                            <FieldLabel htmlFor="password">{t("Password")}</FieldLabel>
                            <Link href="/auth/recover" className="text-muted-foreground text-sm underline-offset-4 hover:underline">
                                {t("ForgotPassword")}
                            </Link>
                        </div>
                        <Input id="password" type="password" required />
                    </Field>
                    <Field>
                        <Button type="submit">{t("Login")}</Button>
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
