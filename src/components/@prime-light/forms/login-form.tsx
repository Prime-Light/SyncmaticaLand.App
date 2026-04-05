"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Eye, EyeOff, Key, RectangleEllipsis, Stone } from "lucide-react";
import { Prime, Shadcn } from "@/components";
import { useEmailStore } from "@/lib/stores/email";
import { cn } from "@/lib/utils";
import { IApiErrorResponse } from "@/types/api-error";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter();
    const emailStore = useEmailStore();
    const [captchaSolved, setCaptchaSolved] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [otpMode, setOtpMode] = useState(false);
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

        if (!otpMode) {
            const formData = new FormData(formRef.current);
            const body = {
                email: formData.get("email") as string,
                password: formData.get("password") as string,
            };

            setIsPending(true);

            try {
                const res = await axios.post("/api/v1/auth/login", body);
                if (res.data?.data) {
                    toast.success("登录成功");
                    window.location.assign("/");
                } else {
                    toast.error("登录失败，请稍后重试");
                }
            } catch (err: unknown) {
                const error = err as AxiosError<IApiErrorResponse>;
                const apiError = error.response?.data?.error;
                if (apiError) {
                    const detailMsg = apiError.details?.error
                        ? `: ${apiError.details.error}`
                        : "";
                    toast.error(`${apiError.message}${detailMsg}`);
                } else {
                    toast.error("登录失败，请稍后重试");
                }
            } finally {
                setIsPending(false);
            }
        } else {
            const formData = new FormData(formRef.current);
            const email = formData.get("email") as string;

            setIsPending(true);

            try {
                const res = await axios.post("/api/v1/auth/login/otp/resend", {
                    email,
                });
                if (res.data?.data) {
                    toast.success(res.data.data.message);
                    emailStore.setEmail(email);
                    router.push(`/auth/login/otp`);
                } else {
                    toast.error("发送验证码失败，请稍后重试");
                }
            } catch (err: unknown) {
                const error = err as AxiosError<IApiErrorResponse>;
                const apiError = error.response?.data?.error;
                if (apiError) {
                    const detailMsg = apiError.details?.error
                        ? `: ${apiError.details.error}`
                        : "";
                    toast.error(`${apiError.message}${detailMsg}`);
                } else {
                    toast.error("发送验证码失败，请稍后重试");
                }
            } finally {
                setIsPending(false);
            }
        }
    };

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
                    {!otpMode && (
                        <Shadcn.Field>
                            <div className="flex items-center justify-between">
                                <Shadcn.FieldLabel htmlFor="password">
                                    {"密码"}
                                </Shadcn.FieldLabel>
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
                    )}
                    <Shadcn.Field>
                        <Shadcn.FieldLabel htmlFor="cap">{"人机验证"}</Shadcn.FieldLabel>
                        <Prime.Captcha onSolve={setCaptchaSolved} />
                    </Shadcn.Field>
                    <Shadcn.Field>
                        <Shadcn.Button
                            type="submit"
                            disabled={isPending || !captchaSolved || !isFormValid}>
                            {isPending ? "登录中..." : !otpMode ? "登录" : "获取验证码"}
                        </Shadcn.Button>
                    </Shadcn.Field>
                    <Shadcn.FieldSeparator>{"或"}</Shadcn.FieldSeparator>
                    <Shadcn.Field className="flex flex-row justify-around gap-4">
                        <Shadcn.Tooltip>
                            <Shadcn.TooltipTrigger asChild>
                                <Shadcn.Button
                                    className="flex-1"
                                    variant="outline"
                                    type="button"
                                    onClick={() => setOtpMode(!otpMode)}>
                                    {otpMode ? <Key /> : <RectangleEllipsis />}
                                </Shadcn.Button>
                            </Shadcn.TooltipTrigger>
                            <Shadcn.TooltipContent>
                                <span>{otpMode ? "密码登录" : "OTP 验证码登录"}</span>
                            </Shadcn.TooltipContent>
                        </Shadcn.Tooltip>
                        <Shadcn.Tooltip>
                            <Shadcn.TooltipTrigger asChild>
                                <Shadcn.Button
                                    className="flex-1"
                                    variant="outline"
                                    type="button"
                                    disabled>
                                    <Prime.IconifyIcon
                                        icon="logos:microsoft-icon"
                                        className="size-4"
                                    />
                                </Shadcn.Button>
                            </Shadcn.TooltipTrigger>
                            <Shadcn.TooltipContent>
                                <span>Microsoft (暂不可用)</span>
                            </Shadcn.TooltipContent>
                        </Shadcn.Tooltip>
                        <Shadcn.Tooltip>
                            <Shadcn.TooltipTrigger asChild>
                                <Shadcn.Button
                                    className="flex-1"
                                    variant="outline"
                                    type="button"
                                    disabled>
                                    <Prime.IconifyIcon
                                        icon="logos:google-icon"
                                        className="size-4"
                                    />
                                </Shadcn.Button>
                            </Shadcn.TooltipTrigger>
                            <Shadcn.TooltipContent>
                                <span>Google (暂不可用)</span>
                            </Shadcn.TooltipContent>
                        </Shadcn.Tooltip>
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
