"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Stone } from "lucide-react";
import { Prime, Shadcn } from "@/components";
import { cn } from "@/lib/utils";
import { IApiErrorResponse } from "@/types/api-error";

type RegisterActionState = {
    success: boolean;
    messageKey: "" | "missing_fields" | "register_success" | "register_failed" | "email_invalid" | "password_short";
};

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
    const [state, setState] = useState<RegisterActionState>({ success: false, messageKey: "" });
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
            display_name: formData.get("name") as string,
            redirect_url: undefined,
        };

        setIsPending(true);
        setState({ success: false, messageKey: "" });

        try {
            const res = await axios.post("/api/v1/auth/register", body);
            if (res.data?.data) {
                setState({ success: true, messageKey: "register_success" });
            } else {
                setState({ success: false, messageKey: "register_failed" });
            }
        } catch (err: unknown) {
            const error = err as AxiosError<IApiErrorResponse>;
            if (error.response?.status === 400 && error.response.data?.error) {
                const code = error.response.data.error.code;
                if (code === 400) setState({ success: false, messageKey: "register_failed" });
                if (code === 401) setState({ success: false, messageKey: "email_invalid" });
            } else {
                setState({ success: false, messageKey: "register_failed" });
            }
        } finally {
            setIsPending(false);
        }
    };

    const messageTextByKey: Record<Exclude<RegisterActionState["messageKey"], "">, string> = {
        missing_fields: "请填写用户名、邮箱和密码",
        register_success: "注册成功",
        register_failed: "注册失败，请稍后重试",
        email_invalid: "邮箱格式错误",
        password_short: "密码长度不能小于8个字符",
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
            <form onSubmit={handleSubmit} onChange={handleFormChange} ref={formRef}>
                <Shadcn.FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <a href="#" className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex size-8 items-center justify-center rounded-md">
                                <Stone className="size-6" />
                            </div>
                        </a>
                        <h1 className="text-xl font-bold">{"创建账号"}</h1>
                        <Shadcn.FieldDescription>
                            {"已有账号？"} <Link href="/auth/login">{"登录"}</Link>
                        </Shadcn.FieldDescription>
                    </div>

                    <Shadcn.Field>
                        <Shadcn.FieldLabel htmlFor="name">{"用户名"}</Shadcn.FieldLabel>
                        <Shadcn.Input id="name" name="name" type="text" placeholder="您的用户名" required />
                    </Shadcn.Field>

                    <Shadcn.Field>
                        <Shadcn.FieldLabel htmlFor="email">{"邮箱"}</Shadcn.FieldLabel>
                        <Shadcn.Input id="email" name="email" type="email" placeholder="me@example.com" required />
                    </Shadcn.Field>

                    <Shadcn.Field>
                        <Shadcn.FieldLabel htmlFor="password">{"密码"}</Shadcn.FieldLabel>
                        <div className="relative">
                            <Shadcn.Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required className="pr-10" />
                            <Shadcn.Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                tabIndex={-1}
                                aria-label={showPassword ? "隐藏密码" : "显示密码"}
                                className="absolute right-0 top-0 size-full max-w-10 hover:bg-transparent"
                                onClick={() => setShowPassword((v) => !v)}
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </Shadcn.Button>
                        </div>
                    </Shadcn.Field>

                    <Shadcn.Field>
                        <Shadcn.FieldLabel htmlFor="captcha">{"人机验证"}</Shadcn.FieldLabel>
                        <Prime.Captcha onSolve={setCaptchaSolved} />
                    </Shadcn.Field>

                    {messageText && (
                        <Shadcn.Alert
                            variant={state.success ? "default" : "destructive"}
                            className={state.success ? "border-green-500/50 text-green-600" : ""}>
                            {state.success ? <CheckCircle2 /> : <AlertCircle />}
                            <Shadcn.AlertTitle>{state.success ? "成功" : "失败"}</Shadcn.AlertTitle>
                            <Shadcn.AlertDescription className={state.success ? "text-green-600/90" : ""}>
                                {messageText}
                                {state.success && <span className="ml-1">({`${countdown}秒后跳转主页`})</span>}
                            </Shadcn.AlertDescription>
                        </Shadcn.Alert>
                    )}

                    <Shadcn.Field>
                        <Shadcn.Button type="submit" disabled={isPending || !captchaSolved || !isFormValid}>
                            {isPending ? "注册中..." : "注册"}
                        </Shadcn.Button>
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
