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

    // 滚动到指定 index
    const scrollToIndex = useCallback((index: number) => {
        const container = containerRef.current;
        if (!container) return;

        const slide = container.children[index] as HTMLElement;
        if (!slide) return;

        setCurrent(index); // 立即更新
        setProgress(0);
        isScrolling.current = true;

        slide.scrollIntoView({
            behavior: "smooth",
            inline: "start",
        });
        setTimeout(() => {
            isScrolling.current = false;
        }, 500);
    }, []);

    const next = useCallback(() => {
        if (isScrolling.current) return;
        scrollToIndex((current + 1) % slides.length);
    }, [current, slides.length, scrollToIndex]);

    const prev = useCallback(() => {
        if (isScrolling.current) return;
        scrollToIndex((current - 1 + slides.length) % slides.length);
    }, [current, slides.length, scrollToIndex]);

    // 自动轮播
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

    // 监听 scroll 结束
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateIndex = () => {
            const slideWidth = container.clientWidth;
            const index = Math.round(container.scrollLeft / slideWidth);
            setCurrent(index);
        };

        // 优先使用 scrollend
        const handleScrollEnd = () => {
            updateIndex();
        };

        if ("onscrollend" in window) {
            container.addEventListener("scrollend", handleScrollEnd);
            return () => container.removeEventListener("scrollend", handleScrollEnd);
        }

        // fallback：简单 debounce
        const handleScroll = () => {
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

            scrollTimeout.current = setTimeout(() => {
                updateIndex();
            }, 100);
        };

        container.addEventListener("scroll", handleScroll);

        return () => {
            container.removeEventListener("scroll", handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, []);

    return (
        <div className={`relative mx-auto w-full ${className}`}>
            {/* Slides */}
            <div ref={containerRef} className="no-scrollbar flex h-64 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth rounded-lg">
                {slides.map((slide, idx) => (
                    <div key={idx} className="h-full w-full shrink-0 snap-start">
                        {slide}
                    </div>
                ))}
            </div>

            {/* 左右按钮 */}
            <button className="absolute top-1/2 -left-8 -translate-y-1/2 rounded-full" onClick={prev}>
                <ChevronLeft />
            </button>

            <button className="absolute top-1/2 -right-8 -translate-y-1/2 rounded-full" onClick={next}>
                <ChevronRight />
            </button>

            {/* 分段进度条 */}
            <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 gap-2 px-2">
                {slides.map((_, idx) => (
                    <div key={idx} onClick={() => scrollToIndex(idx)} className="bg-accent h-2 w-10 cursor-pointer overflow-hidden rounded-xs">
                        {idx === current && (
                            <div
                                className="bg-accent-foreground/50 h-full"
                                style={{
                                    transition: "width 50ms linear",
                                    width: `${progress}%`,
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
