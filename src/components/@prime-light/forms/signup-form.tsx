"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Stone } from "lucide-react";
import { Prime, Shadcn } from "@/components";
import { registerAction, type RegisterActionState } from "@/app/(backend)/api/account/register/action";
import { cn } from "@/lib/utils";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
    const initialState: RegisterActionState = { success: false, messageKey: "" };
    const [state, formAction, isPending] = useActionState(registerAction, initialState);
    const [countdown, setCountdown] = useState(3);
    const [captchaSolved, setCaptchaSolved] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
        setIsFormValid(e.currentTarget.checkValidity());
    };

    useEffect(() => {
        if (formRef.current) {
            setIsFormValid(formRef.current.checkValidity());
        }
    }, [captchaSolved]);
    const messageTextByKey: Record<Exclude<RegisterActionState["messageKey"], "">, string> = {
        missing_fields: "请填写用户名、邮箱和密码",
        register_success: "注册成功，请登录",
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
                    window.location.assign("/auth/login");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [state.success]);

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form action={formAction} onChange={handleFormChange} ref={formRef}>
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
                        <Shadcn.Input id="password" name="password" type="password" autoComplete="new-password" required />
                    </Shadcn.Field>
                    <Shadcn.Field>
                        <Shadcn.FieldLabel htmlFor="captcha">{"人机验证"}</Shadcn.FieldLabel>
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
                                {state.success && <span className="ml-1">({`${countdown}秒后跳转登录页`})</span>}
                            </Shadcn.AlertDescription>
                        </Shadcn.Alert>
                    ) : null}
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
