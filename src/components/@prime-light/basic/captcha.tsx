"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import "@cap.js/widget";

export function Captcha({ onSolve }: { onSolve: (solved: boolean) => void }) {
    const t = useTranslations("Captcha");
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
            data-cap-api-endpoint="https://appwrite.chuguang.vip:54813/2e988fc0fa"
            data-cap-i18n-verifying-label={t("Verifying")}
            data-cap-i18n-initial-state={t("Initial")}
            data-cap-i18n-solved-label={t("Success")}
            data-cap-i18n-error-label={t("Failed")}
            data-cap-i18n-wasm-disabled={t("WasmDisabled")}
        />
    );
}
