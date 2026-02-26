"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

interface CarouselProps {
    children: ReactNode;
    interval?: number;
    className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({ children, interval = 5000, className = "" }) => {
    const slides = useMemo(() => Children.toArray(children), [children]);

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
    const isScrolling = useRef(false);

    const [current, setCurrent] = useState(0);
    const [progress, setProgress] = useState(0);

    // 获取单个 slide 的偏移宽度（容器宽度）
    const getSlideOffset = useCallback(() => {
        return containerRef.current?.clientWidth ?? 0;
    }, []);

    // 滚动到指定索引（直接控制 scrollLeft）
    const scrollToIndex = useCallback(
        (index: number) => {
            const container = containerRef.current;
            if (!container) return;

            if (isScrolling.current) return;

            setCurrent(index);
            setProgress(0);
            isScrolling.current = true;

            const slideWidth = getSlideOffset();
            // snap-mandatory + gap-4 的情况下，直接用容器宽度计算通常就很准
            const targetLeft = index * slideWidth;

            container.scrollTo({
                left: targetLeft,
                behavior: "smooth",
            });

            // smooth 动画一般 400~600ms 完成，可根据实际感觉调整
            setTimeout(() => {
                isScrolling.current = false;
            }, 600);
        },
        [getSlideOffset]
    );

    const next = useCallback(() => {
        if (isScrolling.current) return;
        scrollToIndex((current + 1) % slides.length);
    }, [current, slides.length, scrollToIndex]);

    const prev = useCallback(() => {
        if (isScrolling.current) return;
        scrollToIndex((current - 1 + slides.length) % slides.length);
    }, [current, slides.length, scrollToIndex]);

    // 自动轮播 + 进度条动画
    useEffect(() => {
        let start = Date.now();

        const timer = setInterval(() => {
            const elapsed = Date.now() - start;
            const pct = Math.min((elapsed / interval) * 100, 100);
            setProgress(pct);

            if (pct >= 100) {
                start = Date.now();
                next();
            }
        }, 50);

        return () => clearInterval(timer);
    }, [current, interval, next]);

    // 监听滚动位置，更新当前索引（支持手动拖动）
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateIndex = () => {
            const slideWidth = getSlideOffset();
            if (slideWidth === 0) return;

            const index = Math.round(container.scrollLeft / slideWidth);
            setCurrent((prev) => (index >= 0 && index < slides.length ? index : prev));
        };

        // 优先使用 scrollend 事件（现代浏览器支持）
        const handleScrollEnd = () => updateIndex();

        if ("onscrollend" in window) {
            container.addEventListener("scrollend", handleScrollEnd);
        }

        // fallback：滚动事件 + debounce
        const handleScroll = () => {
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(updateIndex, 100);
        };

        container.addEventListener("scroll", handleScroll);

        // 初次加载校正
        updateIndex();

        return () => {
            if ("onscrollend" in window) {
                container.removeEventListener("scrollend", handleScrollEnd);
            }
            container.removeEventListener("scroll", handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, [slides.length, getSlideOffset]);

    return (
        <div className={`relative mx-auto mb-10 w-full ${className}`}>
            {/* 轮播容器 */}
            <div ref={containerRef} className="no-scrollbar flex h-64 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth rounded-lg">
                {slides.map((slide, idx) => (
                    <div key={idx} className="h-full w-full shrink-0 snap-start">
                        {slide}
                    </div>
                ))}
            </div>

            {/* 左右箭头 */}
            <button className="absolute top-1/2 -left-10 -translate-y-1/2 cursor-pointer rounded-full p-2 transition-colors" onClick={prev}>
                <ChevronLeft />
            </button>

            <button className="absolute top-1/2 -right-10 -translate-y-1/2 cursor-pointer rounded-full p-2 transition-colors" onClick={next}>
                <ChevronRight />
            </button>

            {/* 底部进度条（可点击） */}
            <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 gap-2 px-2">
                {slides.map((_, idx) => (
                    <div key={idx} onClick={() => scrollToIndex(idx)} className="bg-accent h-2 w-9 cursor-pointer overflow-hidden rounded-xs">
                        {idx === current && (
                            <div
                                className="bg-accent-foreground/70 h-full transition-all duration-100 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
