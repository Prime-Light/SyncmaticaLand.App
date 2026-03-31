"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronDown, Stone } from "lucide-react";
import { Prime, Shadcn } from "@/components";
import { loginAction } from "@/app/(backend)/api/account/login/action";
import { cn } from "@/lib/utils";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    type LoginActionState = Awaited<ReturnType<typeof loginAction>>;
    const initialState: LoginActionState = { success: false, messageKey: "" };
    const [state, formAction, isPending] = useActionState(loginAction, initialState);
    const [countdown, setCountdown] = useState(1);
    const [captchaSolved, setCaptchaSolved] = useState(false);
    const messageTextByKey: Record<Exclude<LoginActionState["messageKey"], "">, string> = {
        missing_fields: "请输入邮箱和密码",
        login_success: "登录成功",
        login_failed: "登录失败，请稍后重试",
        account_banned: "您的账户已被封禁",
        invalid_credentials: "无效的邮箱或密码",
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
                <Shadcn.FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <a href="#" className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex size-8 items-center justify-center rounded-md">
                                <Stone className="size-6" />
                            </div>
                        </a>
                        <h1 className="text-xl font-bold">{"欢迎回来"}</h1>
                        <Shadcn.FieldDescription>
                            {"还没有账号？"} <Link href="/auth/signup">{"注册"}</Link>
                        </Shadcn.FieldDescription>
                    </div>
                    <Shadcn.Field>
                        <Shadcn.FieldLabel htmlFor="email">{"邮箱"}</Shadcn.FieldLabel>
                        <Shadcn.Input id="email" name="email" type="email" placeholder="me@example.com" required />
                    </Shadcn.Field>
                    <Shadcn.Field>
                        <div className="flex items-center justify-between">
                            <Shadcn.FieldLabel htmlFor="password">{"密码"}</Shadcn.FieldLabel>
                            <Link href="/auth/recover" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                                {"忘记密码？"}
                            </Link>
                        </div>
                        <Shadcn.Input id="password" name="password" type="password" autoComplete="current-password" required />
                    </Shadcn.Field>
                    <Shadcn.Field>
                        <Shadcn.FieldLabel htmlFor="cap">{"人机验证"}</Shadcn.FieldLabel>
                        <Prime.Captcha onSolve={setCaptchaSolved} />
                    </Shadcn.Field>
                    {messageText ? (
                        <Shadcn.Alert
                            variant={state.success ? "default" : "destructive"}
                            className={state.success ? "border-green-500/50 text-green-600" : ""}>
                            {state.success ? <CheckCircle2 /> : <AlertCircle />}
                            <Shadcn.AlertTitle>{state.success ? "成功" : "失败"}</Shadcn.AlertTitle>
                            <Shadcn.AlertDescription className={state.success ? "text-green-600/90" : ""}>
                                {messageText}
                                {state.messageKey && state.messageKey === "account_banned" && (
                                    <>
                                        <br />
                                        原因：{state.reason}
                                    </>
                                )}
                                {state.success && <span className="ml-1">({`${countdown}秒后跳转首页`})</span>}
                            </Shadcn.AlertDescription>
                        </Shadcn.Alert>
                    ) : null}
                    <Shadcn.Field>
                        <Shadcn.Button type="submit" disabled={isPending || !captchaSolved}>
                            {isPending ? "登录中..." : "登录"}
                        </Shadcn.Button>
                    </Shadcn.Field>
                    <Shadcn.FieldSeparator>{"或"}</Shadcn.FieldSeparator>
                    <Shadcn.Field className="grid gap-4 sm:grid-cols-2">
                        <Shadcn.Button variant="outline" type="button">
                            <Prime.IconifyIcon icon="logos:microsoft-icon" className="size-4" />
                            <span className="translate-y-px">{"使用 Microsoft 登录"}</span>
                        </Shadcn.Button>
                        <Shadcn.Button variant="outline" type="button">
                            <Prime.IconifyIcon icon="logos:google-icon" className="size-4" />
                            <span className="translate-y-px">{"使用 Google 登录"}</span>
                        </Shadcn.Button>
                    </Shadcn.Field>
                    <Shadcn.Field className="items-center">
                        <Shadcn.DropdownMenu>
                            <Shadcn.DropdownMenuTrigger asChild>
                                <Shadcn.Button variant="outline" type="button" className="w-full justify-center gap-2">
                                    <span>{"更多登录方式"}</span>
                                    <ChevronDown className="size-4" />
                                </Shadcn.Button>
                            </Shadcn.DropdownMenuTrigger>
                            <Shadcn.DropdownMenuContent align="center">
                                <Shadcn.DropdownMenuItem className="justify-center gap-2 text-center">
                                    <Prime.IconifyIcon icon="logos:github-icon" className="size-4" />
                                    <span className="translate-y-px">{"使用 Github 登录"}</span>
                                </Shadcn.DropdownMenuItem>
                                <Shadcn.DropdownMenuItem className="justify-center gap-2 text-center">
                                    <Prime.IconifyIcon icon="logos:discord-icon" className="size-4" />
                                    <span className="translate-y-px">{"使用 Discord 登录"}</span>
                                </Shadcn.DropdownMenuItem>
                            </Shadcn.DropdownMenuContent>
                        </Shadcn.DropdownMenu>
                    </Shadcn.Field>
                </Shadcn.FieldGroup>
            </form>
            <Shadcn.FieldDescription className="px-6 text-center">
                {"点击继续即表示你同意我们的"}
                <Link href="/docs/terms-of-service">{"服务条款"}</Link>
                {"和"}
                <Link href="/docs/privacy-policy">{"隐私政策"}</Link>
            </Shadcn.FieldDescription>
        </div>
    );
}
