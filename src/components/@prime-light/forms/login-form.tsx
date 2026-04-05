"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { AlertCircle, CheckCircle2, ChevronDown, Eye, EyeOff, Stone } from "lucide-react";
import { Prime, Shadcn } from "@/components";
import { cn } from "@/lib/utils";
import { IApiErrorResponse } from "@/types/api-error";

type LoginActionState = {
    success: boolean;
    message: string;
};

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const [state, setState] = useState<LoginActionState>({ success: false, message: "" });
    const [countdown, setCountdown] = useState(3);
    const [captchaSolved, setCaptchaSolved] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleFormChange = (e: React.ChangeEvent<HTMLFormElement>) => {
        setIsFormValid(e.currentTarget.checkValidity());
    };

    useEffect(() => {
        if (formRef.current) {
            setIsFormValid(formRef.current.checkValidity());
        }
    }, [captchaSolved]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        const body = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        };

        setIsPending(true);
        setState({ success: false, message: "" });

        try {
            const res = await axios.post("/api/v1/auth/login", body);
            if (res.data?.data) {
                setState({ success: true, message: "登录成功" });
            } else {
                setState({ success: false, message: "登录失败，请稍后重试" });
            }
        } catch (err: unknown) {
            const error = err as AxiosError<IApiErrorResponse>;
            const apiError = error.response?.data?.error;
            if (apiError) {
                const detailMsg = apiError.details?.error ? `: ${apiError.details.error}` : "";
                setState({ success: false, message: `${apiError.message}${detailMsg}` });
            } else {
                setState({ success: false, message: "登录失败，请稍后重试" });
            }
        } finally {
            setIsPending(false);
        }
    };

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
            <form onSubmit={handleSubmit} onChange={handleFormChange} ref={formRef}>
                <Shadcn.FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <a href="#" className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex size-8 items-center justify-center rounded-md">
                                <Stone className="size-6" />
                            </div>
                        </a>
                        <h1 className="text-xl font-bold">{"欢迎回来"}</h1>
                        <Shadcn.FieldDescription>
                            {"还没有账号？"} <Link href="/auth/register">{"注册"}</Link>
                        </Shadcn.FieldDescription>
                    </div>
                    <Shadcn.Field>
                        <Shadcn.FieldLabel htmlFor="email">{"邮箱"}</Shadcn.FieldLabel>
                        <Shadcn.Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="me@example.com"
                            required
                        />
                    </Shadcn.Field>
                    <Shadcn.Field>
                        <div className="flex items-center justify-between">
                            <Shadcn.FieldLabel htmlFor="password">{"密码"}</Shadcn.FieldLabel>
                            <Link
                                href="/auth/recover"
                                className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                                {"忘记密码？"}
                            </Link>
                        </div>
                        <div className="relative">
                            <Shadcn.Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                className="pr-10"
                            />
                            <Shadcn.Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                tabIndex={-1}
                                aria-label={showPassword ? "隐藏密码" : "显示密码"}
                                className="absolute top-0 right-0 size-full max-w-10 hover:bg-transparent"
                                onClick={() => setShowPassword((v) => !v)}>
                                {showPassword ? <EyeOff /> : <Eye />}
                            </Shadcn.Button>
                        </div>
                    </Shadcn.Field>
                    <Shadcn.Field>
                        <Shadcn.FieldLabel htmlFor="cap">{"人机验证"}</Shadcn.FieldLabel>
                        <Prime.Captcha onSolve={setCaptchaSolved} />
                    </Shadcn.Field>
                    {state.message && (
                        <Shadcn.Alert
                            variant={state.success ? "default" : "destructive"}
                            className={state.success ? "border-green-500/50 text-green-600" : ""}>
                            {state.success ? <CheckCircle2 /> : <AlertCircle />}
                            <Shadcn.AlertTitle>{state.success ? "成功" : "失败"}</Shadcn.AlertTitle>
                            <Shadcn.AlertDescription className={state.success ? "text-green-600/90" : ""}>
                                {state.message}
                                {state.success && <span className="ml-1">({`${countdown}秒后跳转首页`})</span>}
                            </Shadcn.AlertDescription>
                        </Shadcn.Alert>
                    )}
                    <Shadcn.Field>
                        <Shadcn.Button type="submit" disabled={isPending || !captchaSolved || !isFormValid}>
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
