"use client";

import { Button, Footer } from "@/components";
import gsap from "gsap";
import { Compass, FileText, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Typewriter from "typewriter-effect";

type Point2D = {
    x: number;
    y: number;
    vx: number;
    vy: number;
};

export default function Index() {
    const heroRef = useRef<HTMLElement | null>(null);
    const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!heroRef.current) {
            return;
        }

        const ctx = gsap.context(() => {
            gsap.from("[data-hero-item]", {
                opacity: 0,
                y: 26,
                duration: 0.9,
                stagger: 0.1,
                ease: "power3.out",
            });
        }, heroRef);

        return () => {
            ctx.revert();
        };
    }, []);

    useEffect(() => {
        const canvas = particleCanvasRef.current;
        if (!canvas) {
            return;
        }

        const context = canvas.getContext("2d");
        if (!context) {
            return;
        }

        let width = 0;
        let height = 0;
        let points: Point2D[] = [];
        let frameId = 0;

        const init = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            const count = width < 768 ? 70 : 120;
            points = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
            }));
        };

        const draw = () => {
            context.clearRect(0, 0, width, height);
            context.fillStyle = "rgba(59, 130, 246, 0.72)";
            context.strokeStyle = "rgba(59, 130, 246, 0.22)";
            context.lineWidth = 0.8;

            for (let i = 0; i < points.length; i += 1) {
                const point = points[i];
                point.x += point.vx;
                point.y += point.vy;

                if (point.x < 0 || point.x > width) {
                    point.vx *= -1;
                }
                if (point.y < 0 || point.y > height) {
                    point.vy *= -1;
                }

                context.beginPath();
                context.arc(point.x, point.y, 1.4, 0, Math.PI * 2);
                context.fill();

                for (let j = i + 1; j < points.length; j += 1) {
                    const other = points[j];
                    const dx = point.x - other.x;
                    const dy = point.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 125) {
                        context.globalAlpha = (1 - distance / 125) * 0.55;
                        context.beginPath();
                        context.moveTo(point.x, point.y);
                        context.lineTo(other.x, other.y);
                        context.stroke();
                    }
                }
            }

            context.globalAlpha = 1;
            frameId = requestAnimationFrame(draw);
        };

        init();
        draw();
        window.addEventListener("resize", init);

        return () => {
            window.removeEventListener("resize", init);
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
        };
    }, []);

    const t = useTranslations("Pages.Index");

    return (
        <main className="relative  overflow-hidden bg-background text-foreground">
            <canvas ref={particleCanvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-55 dark:opacity-75" />
            <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_24%,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_78%_30%,rgba(14,165,233,0.08),transparent_46%),radial-gradient(circle_at_55%_84%,rgba(59,130,246,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_18%_24%,rgba(37,99,235,0.16),transparent_42%),radial-gradient(circle_at_78%_30%,rgba(14,165,233,0.12),transparent_44%),radial-gradient(circle_at_55%_84%,rgba(59,130,246,0.1),transparent_48%)]" />

            <section
                ref={heroRef}
                className="relative z-10 mx-auto flex h-[calc(100vh-56px-86px)] max-w-4xl items-center justify-center px-6 py-14 text-center md:px-10">
                <div className="w-full space-y-6">
                    <p
                        data-hero-item
                        className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs tracking-[0.12em] text-primary">
                        {t("BetaAvailable")}
                    </p>

                    <h1 data-hero-item className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                        <Typewriter
                            onInit={(typewriter) => {
                                typewriter.typeString(t("Title1")).pauseFor(900).deleteAll(70).typeString(t("Title2")).pauseFor(1400).start();
                            }}
                            options={{
                                autoStart: true,
                                loop: true,
                                delay: 110,
                                deleteSpeed: 65,
                                cursor: "|",
                            }}
                        />
                    </h1>

                    <p data-hero-item className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                        {t("Description")}
                    </p>

                    <div data-hero-item className="flex flex-wrap items-center justify-center gap-3">
                        <Button asChild size="lg">
                            <Link href="/schematics" className="inline-flex items-center gap-2">
                                <Compass className="h-4 w-4" />
                                {t("BtnStartBrowse")}
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link href="/api-docs" className="inline-flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {t("BtnApiDocs")}
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link href="/about" className="inline-flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {t("BtnAboutUs")}
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
