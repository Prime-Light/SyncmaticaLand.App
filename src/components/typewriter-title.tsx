"use client";

import { useState, useEffect, useCallback } from "react";

const TYPING_SPEED = 100; // 打字速度 (ms)
const DELETING_SPEED = 50; // 删除速度 (ms)
const PAUSE_TIME = 2000; // 切换前暂停时间 (ms)

type TypewriterState = {
    text: string;
    isDeleting: boolean;
    isPaused: boolean;
    titleIndex: number;
};

export function TypewriterTitle({ className = "", contents }: { className?: string; contents: { text: string; lang: string }[] }) {
    const [state, setState] = useState<TypewriterState>({
        text: "",
        isDeleting: false,
        isPaused: false,
        titleIndex: 0,
    });

    const tick = useCallback(() => {
        setState((prev) => {
            const currentTitle = contents[prev.titleIndex].text;

            // 暂停状态
            if (prev.isPaused) {
                return prev;
            }

            // 删除模式
            if (prev.isDeleting) {
                if (prev.text === "") {
                    // 删除完成，切换到下一个标题
                    return {
                        text: "",
                        isDeleting: false,
                        isPaused: false,
                        titleIndex: (prev.titleIndex + 1) % contents.length,
                    };
                }
                // 继续删除
                return {
                    ...prev,
                    text: prev.text.slice(0, -1),
                };
            }

            // 打字模式
            if (prev.text === currentTitle) {
                // 打字完成，进入暂停
                return {
                    ...prev,
                    isPaused: true,
                };
            }
            // 继续打字
            return {
                ...prev,
                text: currentTitle.slice(0, prev.text.length + 1),
            };
        });
    }, [contents]);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (state.isPaused) {
            timer = setTimeout(() => {
                setState((prev) => ({ ...prev, isPaused: false, isDeleting: true }));
            }, PAUSE_TIME);
        } else {
            const speed = state.isDeleting ? DELETING_SPEED : TYPING_SPEED;
            timer = setTimeout(tick, speed);
        }

        return () => clearTimeout(timer);
    }, [state, tick]);

    return (
        <h1
            className={`text-2xl font-bold tracking-tighter xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl wrap-break-word ${className}`}>
            <span className="inline-block min-h-[1.2em]">
                {state.text}
                <span className="animate-blink ml-1 mb-3 inline-block h-[0.8em] w-0.75 bg-current align-middle" />
            </span>
        </h1>
    );
}
