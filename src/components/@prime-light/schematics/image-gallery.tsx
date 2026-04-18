"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Shadcn } from "@/components";
import { cn } from "@/lib/utils";

export type ImageGalleryProps = {
    images: string[];
    name: string;
    className?: string;
    skeleton?: boolean;
};

export function ImageGallery({ images, name, className, skeleton = false }: ImageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const hasImages = images.length > 0;

    const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
    const next = () => setActiveIndex((i) => (i + 1) % images.length);

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            {/* 主图 */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                {skeleton ? (
                    <Shadcn.Skeleton className="h-full w-full rounded-xl" />
                ) : hasImages ? (
                    <>
                        <Image
                            key={activeIndex}
                            src={images[activeIndex]}
                            alt={`${name} 预览图 ${activeIndex + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                            priority={activeIndex === 0}
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prev}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1.5 backdrop-blur-sm transition-opacity hover:bg-background/90"
                                    aria-label="上一张">
                                    <ChevronLeft className="size-5" />
                                </button>
                                <button
                                    onClick={next}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1.5 backdrop-blur-sm transition-opacity hover:bg-background/90"
                                    aria-label="下一张">
                                    <ChevronRight className="size-5" />
                                </button>
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveIndex(i)}
                                            className={cn(
                                                "size-2 rounded-full transition-all",
                                                i === activeIndex
                                                    ? "bg-foreground scale-110"
                                                    : "bg-foreground/40 hover:bg-foreground/60"
                                            )}
                                            aria-label={`查看第 ${i + 1} 张图片`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ImageOff className="size-10 opacity-40" />
                        <span className="text-sm">暂无预览图</span>
                    </div>
                )}
            </div>

            {/* 缩略图条：skeleton 时渲染固定数量的占位块，保持结构一致 */}
            {skeleton ? (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {[0, 1, 2].map((i) => (
                        <Shadcn.Skeleton
                            key={i}
                            className="aspect-video h-16 shrink-0 rounded-lg"
                        />
                    ))}
                </div>
            ) : images.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((src, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={cn(
                                "relative aspect-video h-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                                i === activeIndex
                                    ? "border-primary"
                                    : "border-transparent opacity-60 hover:opacity-100"
                            )}>
                            <Image
                                src={src}
                                alt={`缩略图 ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="96px"
                            />
                        </button>
                    ))}
                </div>
            ) : null}

            {/* 图片计数角标 */}
            {skeleton ? (
                <Shadcn.Skeleton className="h-5 w-10 rounded" />
            ) : hasImages ? (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shadcn.Badge variant="secondary">
                        {activeIndex + 1} / {images.length}
                    </Shadcn.Badge>
                </div>
            ) : null}
        </div>
    );
}
