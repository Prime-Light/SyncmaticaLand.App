"use client";

import { RefreshCwIcon, Stone } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Shadcn } from "@/components";
import { cn } from "@/lib/utils";

export type OtpFormProps = React.ComponentProps<"div"> & {
    otp: string;
    onOtpChange: (otp: string) => void;
    email?: string;
    resendTimeout: number;
    isPending: boolean;
    isResending: boolean;
    onResend: () => void;
    onVerify: (e: React.SubmitEvent<HTMLFormElement>) => void;
    topText: string;
};

export function ReusableOtpForm({
    className,
    otp,
    onOtpChange,
    email,
    resendTimeout,
    isPending,
    isResending,
    onResend,
    onVerify,
    topText,
    ...props
}: OtpFormProps) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form onSubmit={onVerify}>
                <Shadcn.FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex size-8 items-center justify-center rounded-md">
                            <Stone className="size-6" />
                        </div>
                        <h1 className="text-xl font-bold">{topText}</h1>
                    </div>

                    <Shadcn.Field className="mt-4">
                        <div className="flex items-center justify-between">
                            <Shadcn.FieldLabel htmlFor="otp-verification">
                                OTP 验证码
                            </Shadcn.FieldLabel>
                            <Shadcn.Button
                                variant="outline"
                                size="xs"
                                disabled={resendTimeout > 0 || isResending || !email}
                                type="button"
                                onClick={onResend}>
                                <RefreshCwIcon className={cn(isResending && "animate-spin")} />
                                {isResending
                                    ? "发送中..."
                                    : resendTimeout > 0
                                      ? `${resendTimeout} 秒后重发`
                                      : "重发"}
                            </Shadcn.Button>
                        </div>
                        <div className="flex items-center justify-center">
                            <Shadcn.InputOTP
                                maxLength={6}
                                id="otp-verification"
                                required
                                pattern={REGEXP_ONLY_DIGITS}
                                value={otp}
                                onChange={onOtpChange}>
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

                    <Shadcn.Field>
                        <Shadcn.Button
                            type="submit"
                            className="w-full"
                            disabled={isPending || otp.length !== 6}>
                            {isPending ? "验证中..." : "验证"}
                        </Shadcn.Button>
                        <div className="text-sm text-muted-foreground">
                            验证失败？{" "}
                            <a
                                href="mailto:admin@chuguang.vip"
                                className="underline underline-offset-4 transition-colors hover:text-primary">
                                联系支持团队
                            </a>
                        </div>
                    </Shadcn.Field>
                </Shadcn.FieldGroup>
            </form>
        </div>
    );
}
