"use client";

import { useEffect, useRef } from "react";

type Point2D = {
    x: number;
    y: number;
    vx: number;
    vy: number;
};

interface ParticleBackgroundProps {
    /** 粒子数量倍率（可选，默认 1） */
    density?: number;
    /** 粒子颜色（默认蓝色系） */
    particleColor?: string;
    /** 连接线颜色 */
    lineColor?: string;
    /** 最大连接距离（像素） */
    connectionDistance?: number;
    /** 整体透明度 */
    opacity?: number;
    className?: string;
}

export default function ParticleBackground({
    density = 1,
    particleColor = "rgba(59, 130, 246, 0.72)",
    lineColor = "rgba(59, 130, 246, 0.22)",
    connectionDistance = 125,
    opacity = 0.55,
    className = "",
}: ParticleBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let points: Point2D[] = [];
        let frameId = 0;

        const init = () => {
            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width;
            canvas.height = height;

            // 根据屏幕宽度和密度动态调整粒子数量
            const baseCount = width < 768 ? 70 : 120;
            const count = Math.floor(baseCount * density);

            points = Array.from({ length: Math.max(30, count) }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
            }));
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = particleColor;
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 0.8;

            for (let i = 0; i < points.length; i++) {
                const point = points[i];

                // 更新位置
                point.x += point.vx;
                point.y += point.vy;

                // 边界碰撞反弹
                if (point.x < 0 || point.x > width) point.vx *= -1;
                if (point.y < 0 || point.y > height) point.vy *= -1;

                // 绘制粒子
                ctx.beginPath();
                ctx.arc(point.x, point.y, 1.4, 0, Math.PI * 2);
                ctx.fill();

                // 绘制连接线
                for (let j = i + 1; j < points.length; j++) {
                    const other = points[j];
                    const dx = point.x - other.x;
                    const dy = point.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.globalAlpha = (1 - distance / connectionDistance) * 0.55;
                        ctx.beginPath();
                        ctx.moveTo(point.x, point.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.stroke();
                    }
                }
            }

            ctx.globalAlpha = 1;
            frameId = requestAnimationFrame(draw);
        };

        // 初始化并启动动画
        init();
        draw();

        // 窗口大小变化时重新初始化
        const handleResize = () => init();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
        };
    }, [density, particleColor, lineColor, connectionDistance]);

    return <canvas ref={canvasRef} className={`pointer-events-none fixed inset-0 z-0 ${className}`} style={{ opacity }} />;
}
