"use client";

import { Radix, PrimeLight, ReactBits } from "@/components";
import { FileUp, PackageOpen } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react/jsx-runtime";

const HAS_EVENT = true;
const EVENT = {
    title: "红石光潮节",
    date: "4 月 1 日至 4 月 15 日",
    description: [
        "《投影共和国 · SyncmaticaLand 发行庆典 - Minecraft 红石光潮节》",
        "4 月 1 日至 4 月 15 日期间，上传标有「红石科技」「生电」等标签的资源将获得额外推广支持",
    ],
    buttons: [
        <Radix.Button asChild size="lg" className="bg-red-600 text-white hover:bg-red-600/80!" key="view">
            <Link href="#" className="inline-flex items-center gap-2">
                {/* /schematics/featured/tide-n-light */}
                <PackageOpen className="size-4" />
                立即查看
            </Link>
        </Radix.Button>,
        <Radix.Button asChild size="lg" variant="outline" key="contribute">
            <Link href="#" className="inline-flex items-center gap-2">
                <FileUp className="size-4" />
                立即投稿
            </Link>
        </Radix.Button>,
    ],
};

export default function SchematicsIndex() {
    return (
        <main className="bg-background text-foreground relative overflow-x-hidden">
            {HAS_EVENT && (
                <section className="relative h-[calc(100vh*0.8)] object-cover">
                    <div className="absolute top-1/3 z-3 flex w-full -translate-x-2 -translate-y-1/4 flex-col items-center">
                        <Radix.Typography.H1 className="atext-4xl translate-x-1 leading-tight font-bold text-red-500 text-shadow-[0_0_2px,0_0_6px,0_0_12px,0_0_24px] text-shadow-red-800 sm:text-5xl lg:text-6xl dark:text-red-600 dark:text-shadow-red-900">
                            <ReactBits.TextType loop={false} cursorCharacter="" className="tracking-widest!" text={EVENT.title} />
                        </Radix.Typography.H1>
                        <Radix.Typography.P className="text-center text-base leading-relaxed sm:text-lg">
                            {EVENT.description.map((item, index) => (
                                <Fragment key={index}>
                                    {item}
                                    <br />
                                </Fragment>
                            ))}
                        </Radix.Typography.P>
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
                            {EVENT.buttons.map((button, index) => (
                                <Fragment key={index}>{button}</Fragment>
                            ))}
                        </div>
                    </div>
                    <div className="from-background/20 to-background absolute z-2 h-full w-full bg-linear-to-b backdrop-blur-xs"></div>
                    <PrimeLight.ThemedImage src="launching-banner.webp" layout="fill" style={{ objectFit: "cover" }} alt="Launching Banner" />
                </section>
            )}
            <section className="mx-auto mb-12 max-w-3/4">
                <Radix.Typography.H4 className="">最新资源</Radix.Typography.H4>
                <PrimeLight.Carousel interval={5000} className="mt-4 max-w-11/12">
                    <Radix.Skeleton className="h-full w-full" />
                    <Radix.Skeleton className="h-full w-full" />
                    <Radix.Skeleton className="h-full w-full" />
                </PrimeLight.Carousel>
                <section className="h-[calc(100vh-112px)]">
                    <Radix.Typography.H4 className="my-4">浏览全部</Radix.Typography.H4>
                    <PrimeLight.SchematicFeed />
                </section>
            </section>
        </main>
    );
}
