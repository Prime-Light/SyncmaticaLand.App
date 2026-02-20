"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ChevronDown, Github, MessageCircle, Stone } from "lucide-react";
import { useTranslations } from "next-intl";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const t = useTranslations("Pages.Login");
    const moreLoginMethods = t.has("MoreLoginMethods") ? t("MoreLoginMethods") : "More login methods";
    const loginWithGithub = t.has("LoginWithGithub") ? t("LoginWithGithub") : "Continue with GitHub";
    const loginWithMicrosoft = t.has("LoginWithMicrosoft") ? t("LoginWithMicrosoft") : "Continue with Microsoft";
    const loginWithDiscord = t.has("LoginWithDiscord") ? t("LoginWithDiscord") : "Continue with Discord";

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
                            {t("NoAccount")} <a href="#">{t("SignUp")}</a>
                        </FieldDescription>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="email">{t("Email")}</FieldLabel>
                        <Input id="email" type="email" placeholder="m@example.com" required />
                    </Field>
                    <Field>
                        <div className="flex items-center justify-between">
                            <FieldLabel htmlFor="password">{t("Password")}</FieldLabel>
                            <a href="#" className="text-muted-foreground text-sm underline-offset-4 hover:underline">
                                {t("ForgotPassword")}
                            </a>
                        </div>
                        <Input id="password" type="password" required />
                    </Field>
                    <Field>
                        <Button type="submit">{t("Login")}</Button>
                    </Field>
                    <FieldSeparator>{t("Or")}</FieldSeparator>
                    <Field className="grid gap-4 sm:grid-cols-2">
                        <Button variant="outline" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" className="size-4">
                                <path fill="#ffffff" d="M1 1h10v10H1z" />
                                <path fill="#ffffff" d="M12 1h10v10H12z" />
                                <path fill="#ffffff" d="M1 12h10v10H1z" />
                                <path fill="#ffffff" d="M12 12h10v10H12z" />
                            </svg>
                            {loginWithMicrosoft}
                        </Button>
                        <Button variant="outline" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path
                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                    fill="currentColor"
                                />
                            </svg>
                            {t("LoginWithGoogle")}
                        </Button>
                    </Field>
                    <Field className="items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" type="button" className="w-full justify-center gap-2">
                                    <span>{moreLoginMethods}</span>
                                    <ChevronDown className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center">
                                <DropdownMenuItem className="justify-center gap-2 text-center">
                                    <Github className="size-4" />
                                    <span>{loginWithGithub}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="justify-center gap-2 text-center">
                                    <MessageCircle className="size-4" />
                                    <span>{loginWithDiscord}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Field>
                </FieldGroup>
            </form>
            <FieldDescription className="px-6 text-center">
                {t("ByClickingContinue")} <a href="#">{t("TermsOfService")}</a> {t("And")}{" "}
                <a href="#">{t("PrivacyPolicy")}</a>.
            </FieldDescription>
        </div>
    );
}
