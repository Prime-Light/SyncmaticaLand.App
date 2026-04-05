"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Eye, EyeOff, Stone } from "lucide-react";
import { Prime, Shadcn } from "@/components";
import { useEmailStore } from "@/lib/stores/email";
import { cn } from "@/lib/utils";
import { IApiErrorResponse } from "@/types/api-error";

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter();
    const emailStore = useEmailStore();
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

        try {
            const res = await axios.post("/api/v1/auth/register", body);
            if (res.data?.data) {
                toast.success(res.data.data.message || "注册成功，请查收验证邮件");
                emailStore.setEmail(body.email);
                router.push(`/auth/register/otp`);
            } else {
                toast.error("注册失败，请稍后重试");
            }
        } catch (err: unknown) {
            const error = err as AxiosError<IApiErrorResponse>;
            const apiError = error.response?.data?.error;
            if (apiError) {
                const detailMsg = apiError.details?.error ? `: ${apiError.details.error}` : "";
                toast.error(`${apiError.message}${detailMsg}`);
            } else {
                toast.error("注册失败，请稍后重试");
            }
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form onSubmit={handleSubmit} onChange={handleFormChange} ref={formRef}>
                <Shadcn.FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex size-8 items-center justify-center rounded-md">
                            <Stone className="size-6" />
                        </div>
                        <h1 className="text-xl font-bold">{"创建账号"}</h1>
                        <Shadcn.FieldDescription>
                            {"已有账号？"} <Link href="/auth/login">{"登录"}</Link>
                        </Shadcn.FieldDescription>
                    </div>

                    <Shadcn.Field>
                        <Shadcn.FieldLabel htmlFor="name">{"用户名"}</Shadcn.FieldLabel>
                        <Shadcn.Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="您的用户名"
                            required
                        />
                    </Shadcn.Field>

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
                        <Shadcn.FieldLabel htmlFor="password">{"密码"}</Shadcn.FieldLabel>
                        <div className="relative">
                            <Shadcn.Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
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
                        <Shadcn.FieldLabel htmlFor="captcha">{"人机验证"}</Shadcn.FieldLabel>
                        <Prime.Captcha onSolve={setCaptchaSolved} />
                    </Shadcn.Field>

                    <Shadcn.Field>
                        <Shadcn.Button
                            type="submit"
                            disabled={isPending || !captchaSolved || !isFormValid}>
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
