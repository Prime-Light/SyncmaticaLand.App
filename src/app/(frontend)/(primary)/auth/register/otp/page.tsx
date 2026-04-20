"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { ReusableOtpForm } from "@/components/@prime-light/forms/otp-form";
import { IApiErrorResponse } from "@/types/api-error";
import { useEmailStore } from "@/lib/stores/email";

export default function Page() {
    const router = useRouter();
    const emailStore = useEmailStore();
    const [email, setEmail] = useState<string | undefined>(undefined);
    const [otp, setOtp] = useState("");
    const [resendTimeout, setResendTimeout] = useState(30);
    const [isPending, setIsPending] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        if (loaded) return;

        if (emailStore.email) {
            setEmail(emailStore.email);
            emailStore.setEmail(null);
            setLoaded(true);
        } else {
            router.replace("/auth/register");
        }
    }, [emailStore, loaded, router]);

    useEffect(() => {
        if (resendTimeout <= 0) return;

        const timer = setTimeout(() => {
            setResendTimeout((t) => t - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [resendTimeout]);

    const handleResend = useCallback(async () => {
        if (!email || isResending) return;

        setIsResending(true);

        try {
            const res = await axios.post("/api/v1/auth/register/otp/resend", {
                email,
            });
            if (res.data?.data) {
                toast.success(res.data.data.message);
                setResendTimeout(30);
            } else {
                toast.error("重发失败，请稍后重试");
            }
        } catch (err: unknown) {
            const error = err as AxiosError<IApiErrorResponse>;
            const apiError = error.response?.data?.error;
            if (apiError) {
                const detailMsg = apiError.details?.error ? `: ${apiError.details.error}` : "";
                toast.error(`${apiError.message}${detailMsg}`);
            } else {
                toast.error("重发失败，请稍后重试");
            }
        } finally {
            setIsResending(false);
        }
    }, [email, isResending]);

    const handleVerify = useCallback(
        async (e: React.SubmitEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!email || !otp || otp.length !== 6 || isPending) return;

            setIsPending(true);

            try {
                const res = await axios.post("/api/v1/auth/register/otp/verify", {
                    email,
                    token: otp,
                });
                if (res.data?.data) {
                    toast.success(res.data.data.message);
                    router.push("/auth/login");
                } else {
                    toast.error("验证失败，请稍后重试");
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
                    toast.error("验证失败，请稍后重试");
                }
            } finally {
                setIsPending(false);
            }
        },
        [email, otp, isPending, router]
    );

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <ReusableOtpForm
                    topText="注册验证"
                    otp={otp}
                    onOtpChange={setOtp}
                    email={email}
                    resendTimeout={resendTimeout}
                    isPending={isPending}
                    isResending={isResending}
                    onResend={handleResend}
                    onVerify={handleVerify}
                />
            </div>
        </div>
    );
}
