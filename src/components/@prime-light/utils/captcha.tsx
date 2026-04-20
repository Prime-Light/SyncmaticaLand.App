"use client";

import { useEffect, useRef } from "react";
import "@cap.js/widget";

export function Captcha({ onSolve }: { onSolve: (solved: boolean) => void }) {
    const captchaRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = captchaRef.current;
        if (!el) return;

        // 假设 Cap Widget 会触发 'solve' 和 'error' 事件
        const handleSolved = (event: Event) => {
            console.log("Captcha solved!", event);
            onSolve(true);
        };
        const handleError = (event: Event) => {
            console.log("Captcha error!", event);
        };

        el.addEventListener("solve", handleSolved);
        el.addEventListener("error", handleError);

        // 清理事件
        return () => {
            el.removeEventListener("solve", handleSolved);
            el.removeEventListener("error", handleError);
        };
    }, [onSolve]);

    return (
        // @ts-expect-error Cap Widget was injected through script
        <cap-widget
            ref={captchaRef}
            id="cap"
            suppressHydrationWarning
            data-cap-api-endpoint={process.env.NEXT_PUBLIC_CAP_API_ENDPOINT}
            data-cap-i18n-verifying-label={"验证中..."}
            data-cap-i18n-initial-state={"点击以验证"}
            data-cap-i18n-solved-label={"成功"}
            data-cap-i18n-error-label={"失败"}
            data-cap-i18n-wasm-disabled={"[!] WASM 已被禁用"}
        />
    );
}
