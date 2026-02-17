import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: [
        "zh-CN", // 中文（简体）
        "zh-TW", // 中文（繁体）
        "en-US", // English (United States)
        "en-GB", // English (United Kingdom)
        "en-UD", // English (upside down)
    ],

    // Used when no locale matches
    defaultLocale: "zh-CN",
});
