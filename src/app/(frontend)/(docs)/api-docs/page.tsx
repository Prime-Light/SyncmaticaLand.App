"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import "./ui.css";
import { useCallback, useEffect, useRef } from "react";
import { Prime, Shadcn } from "@/components";
import Link from "next/link";
import { Home } from "lucide-react";
import { createRoot } from "react-dom/client";
import { useTheme } from "next-themes";

export default function DocsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    const applyThemeToElement = useCallback(
        (dom: Element) => {
            const dark = theme === "dark";
            dom.classList.remove(`${dark ? "light" : "dark"}-mode`);
            dom.classList.add(`${dark ? "dark" : "light"}-mode`);
        },
        [theme]
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 定义需要替换的英文 → 中文映射表（可自行扩展）
        const translations: Record<string, string> = {
            Introduction: "简介",
            "Download OpenAPI Document": "下载 OpenAPI 文档",
            Server: "服务器",
            "Client Libraries": "客户端库",
            "Show Schema": "展示 Schema",
            Body: "请求体",
            Responses: "响应",
            "Show Child Attributes": "展示子属性",
            "Hide Child Attributes": "隐藏子属性",
            " required ": "必须",
            "min length": "最短",
            "max length": "最长",
            values: "值",
            Example: "样例",
            Search: "搜索",
        };

        // 执行替换的函数
        const replaceText = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                let text = node.textContent || "";
                Object.keys(translations).forEach((english) => {
                    if (text.includes(english)) {
                        // Use plain substring replacement to avoid regex metacharacter issues in keys
                        text = text.split(english).join(translations[english]);
                    }
                });
                if (text !== node.textContent) {
                    node.textContent = text;
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // 递归处理子节点
                (node as Element).childNodes.forEach(replaceText);
            }
        };

        // 使用 MutationObserver 监听 DOM 变化（推荐，高效且实时）
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // 处理新增节点
                mutation.addedNodes.forEach(replaceText);

                // 针对文本内容变化的节点，直接处理变更目标
                if (mutation.type === "characterData" && mutation.target) {
                    replaceText(mutation.target as Node);
                }
            });
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
            characterData: true, // 监听文本节点变化
        });

        // 初始执行一次替换
        replaceText(container);

        // 插入额外元素
        const dom = container
            .querySelector('aside[role="navigation"]')
            ?.querySelector("div.darklight-reference");
        if (!dom) return;
        const asideBottom = createRoot(dom);
        asideBottom.render(
            <div className="w-full">
                <Link href="/">
                    <Shadcn.Button className="w-full" variant="outline">
                        <Home />
                        <span className="ml-2">返回主页</span>
                    </Shadcn.Button>
                </Link>
            </div>
        );

        // 清理函数
        return () => {
            observer.disconnect();
        };
    }, []);

    // 单向同步主题
    useEffect(() => {
        if (theme === "system") return;
        // 单次操作
        const apply = () => {
            applyThemeToElement(document.body);
            document.querySelectorAll("div.request-card").forEach((el) => {
                applyThemeToElement(el);
            });
        };
        // 初始跑一遍
        apply();
        // 监听 DOM 变化
        const observer = new MutationObserver(() => {
            apply();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        return () => observer.disconnect();
    }, [theme, applyThemeToElement]);

    return (
        <div ref={containerRef} className="max-h-svh">
            <div suppressHydrationWarning>
                <ApiReferenceReact
                    configuration={{
                        url: "/api/v1/metadata",

                        hideModels: false, // 是否隐藏 Models 部分
                        hideTestRequestButton: true, // 是否隐藏在线测试按钮
                        hideDarkModeToggle: true,
                        showSidebar: true, // 显示侧边栏
                        expandAllResponses: true, // 是否展开所有响应体
                        expandAllModelSections: true, // 是否展开所有模型部分
                        theme: "default", // 'default' | 'purple' | 'solarized' 等
                        layout: "modern", // 布局风格

                        agent: {
                            disabled: true, // 完全禁用 AI 功能
                        },

                        showDeveloperTools: "never",
                    }}
                />
            </div>
        </div>
    );
}
