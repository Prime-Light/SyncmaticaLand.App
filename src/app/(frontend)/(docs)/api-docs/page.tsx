"use client";

// import dynamic from "next/dynamic";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import "./ui.css";
import { useEffect, useRef } from "react";

// const Redoc = dynamic(() => import("redoc").then((mod) => mod.RedocStandalone), { ssr: false });

export default function DocsPage() {
    const containerRef = useRef<HTMLDivElement>(null);

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
            "values": "值",
            Example: "样例",
            Search: "搜索",
        };

        // 执行替换的函数
        const replaceText = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                let text = node.textContent || "";
                Object.keys(translations).forEach((english) => {
                    if (text.includes(english)) {
                        text = text.replace(new RegExp(english, "g"), translations[english]);
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
                mutation.addedNodes.forEach(replaceText);
                // 也处理已存在的节点（防止首次加载遗漏）
                replaceText(container);
            });
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
            characterData: true, // 监听文本节点变化
        });

        // 初始执行一次替换
        replaceText(container);

        // 清理函数
        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className="max-h-svh">
            {/* <Redoc specUrl="/api/v1/metadata" /> */}
            <ApiReferenceReact
                // @ts-expect-error 安全地绕过类型检查
                suppressHydrationWarning
                configuration={{
                    url: "/api/v1/metadata",

                    hideModels: false, // 是否隐藏 Models 部分
                    hideTestRequestButton: true, // 是否隐藏在线测试按钮
                    showSidebar: true, // 显示侧边栏
                    theme: "default", // 'default' | 'purple' | 'solarized' 等
                    layout: "modern", // 布局风格

                    agent: {
                        disabled: true, // 完全禁用 AI 功能
                    },

                    showDeveloperTools: "never",
                }}
            />
        </div>
    );
}
