"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Prime } from "@/components";

export default function Page() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialOtp = useMemo(() => searchParams.get("code") ?? undefined, [searchParams]);
    const email = useMemo(() => searchParams.get("email") ?? undefined, [searchParams]);
    const [otp] = useState<string | undefined>(initialOtp);

    useEffect(() => {
        if (initialOtp) {
            const url = new URL(window.location.href);
            url.searchParams.delete("code");
            router.replace(url.toString(), { scroll: false });
        }
    }, [initialOtp, router]);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Prime.OtpForm otp={otp} email={email} />
            </div>
        </div>
    );
}
