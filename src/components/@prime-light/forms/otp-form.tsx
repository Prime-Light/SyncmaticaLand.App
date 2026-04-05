"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { RefreshCwIcon, Stone, AlertCircle } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Shadcn } from "@/components";
import { cn } from "@/lib/utils";
import { IApiErrorResponse } from "@/types/api-error";

type OtpFormState = {
    success: boolean;
    message: string;
};

export function OtpForm({
    className,
    otp: initialOtp,
    email,
    ...props
}: React.ComponentProps<"div"> & { otp?: string; email?: string }) {
    const router = useRouter();
    const [otp, setOtp] = useState(initialOtp ?? "");
    const [resendTimeout, setResendTimeout] = useState(30);
    const [isPending, setIsPending] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [state, setState] = useState<OtpFormState>({ success: false, message: "" });

    useEffect(() => {
        if (resendTimeout <= 0) return;

        const timer = setTimeout(() => {
            setResendTimeout((t) => t - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [resendTimeout]);

    const handleResend = async () => {
        if (!email || isResending) return;

        setIsResending(true);
        setState({ success: false, message: "" });

        try {
            const res = await axios.post("/api/v1/auth/register/otp/resend", {
                email,
            });
            if (res.data?.data) {
                setState({ success: true, message: res.data.data.message });
                setResendTimeout(30);
            } else {
                setState({ success: false, message: "重发失败，请稍后重试" });
            }
        } catch (err: unknown) {
            const error = err as AxiosError<IApiErrorResponse>;
            const apiError = error.response?.data?.error;
            if (apiError) {
                const detailMsg = apiError.details?.error ? `: ${apiError.details.error}` : "";
                setState({ success: false, message: `${apiError.message}${detailMsg}` });
            } else {
                setState({ success: false, message: "重发失败，请稍后重试" });
            }
        } finally {
            setIsResending(false);
        }
    };

    const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !otp || otp.length !== 6 || isPending) return;

        setIsPending(true);
        setState({ success: false, message: "" });

        try {
            const res = await axios.post("/api/v1/auth/register/otp/verify", {
                email,
                token: otp,
            });
            if (res.data?.data) {
                setState({ success: true, message: res.data.data.message });
                router.push("/auth/login?verified=true");
            } else {
                setState({ success: false, message: "验证失败，请稍后重试" });
            }
        } catch (err: unknown) {
            const error = err as AxiosError<IApiErrorResponse>;
            const apiError = error.response?.data?.error;
            if (apiError) {
                const detailMsg = apiError.details?.error ? `: ${apiError.details.error}` : "";
                setState({ success: false, message: `${apiError.message}${detailMsg}` });
            } else {
                setState({ success: false, message: "验证失败，请稍后重试" });
            }
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form onSubmit={handleVerify}>
                <Shadcn.FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex size-8 items-center justify-center rounded-md">
                            <Stone className="size-6" />
                        </div>
                        <h1 className="text-xl font-bold">{"创建账号"}</h1>
                    </div>

                    <Shadcn.Field className="mt-4">
                        <div className="flex items-center justify-between">
                            <Shadcn.FieldLabel htmlFor="otp-verification">OTP 验证码</Shadcn.FieldLabel>
                            <Shadcn.Button
                                variant="outline"
                                size="xs"
                                disabled={resendTimeout > 0 || isResending || !email}
                                type="button"
                                onClick={handleResend}
                            >
                                <RefreshCwIcon className={cn(isResending && "animate-spin")} />
                                {isResending ? "发送中..." : resendTimeout > 0 ? `${resendTimeout} 秒后重发` : "重发"}
                            </Shadcn.Button>
                        </div>
                        <div className="flex items-center justify-center">
                            <Shadcn.InputOTP
                                maxLength={6}
                                id="otp-verification"
                                required
                                pattern={REGEXP_ONLY_DIGITS}
                                value={otp}
                                onChange={setOtp}
                            >
                                <Shadcn.InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                    <Shadcn.InputOTPSlot index={0} />
                                    <Shadcn.InputOTPSlot index={1} />
                                    <Shadcn.InputOTPSlot index={2} />
                                </Shadcn.InputOTPGroup>
                                <Shadcn.InputOTPSeparator className="mx-2" />
                                <Shadcn.InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                    <Shadcn.InputOTPSlot index={3} />
                                    <Shadcn.InputOTPSlot index={4} />
                                    <Shadcn.InputOTPSlot index={5} />
                                </Shadcn.InputOTPGroup>
                            </Shadcn.InputOTP>
                        </div>
                    </Shadcn.Field>

                    {state.message && (
                        <Shadcn.Alert variant={state.success ? "default" : "destructive"}>
                            <AlertCircle />
                            <Shadcn.AlertTitle>{state.success ? "成功" : "失败"}</Shadcn.AlertTitle>
                            <Shadcn.AlertDescription>{state.message}</Shadcn.AlertDescription>
                        </Shadcn.Alert>
                    )}

                    <Shadcn.Field>
                        <Shadcn.Button type="submit" className="w-full" disabled={isPending || otp.length !== 6}>
                            {isPending ? "验证中..." : "验证"}
                        </Shadcn.Button>
                        <div className="text-sm text-muted-foreground">
                            验证失败？{" "}
                            <a href="#" className="underline underline-offset-4 transition-colors hover:text-primary">
                                联系支持团队
                            </a>
                        </div>
                    </Shadcn.Field>
                </Shadcn.FieldGroup>
            </form>
        </div>
    );
}
