import Link from "next/link";
import { Compass, FileText, Users } from "lucide-react";

import { Shadcn, Prime, RBits } from "@/components";

export default function Page() {
    return (
        <div className="relative flex h-full flex-col justify-center">
            {/* 背景效果 */}
            <Prime.ParticleBackground opacity={0.55} />

            {/* 主内容 */}
            <section className="relative z-10 mx-auto flex h-full max-w-4xl items-center justify-center px-6 py-14 pt-0 text-center md:px-10">
                <div className="w-full space-y-6">
                    <Shadcn.Badge
                        variant="outline"
                        className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-3.5 text-xs tracking-[0.12em] text-primary">
                        {"测试版现在可用" /* @TODO l10n */}
                    </Shadcn.Badge>

                    <h1 className="mx-auto max-w-3xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
                        <RBits.TextType
                            text={["SyncmaticaLand", "投影共和国"]}
                            loop={true}
                            typingSpeed={110}
                            pauseDuration={1400}
                            deletingSpeed={65}
                            cursorCharacter="|"></RBits.TextType>
                    </h1>

                    <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                        {
                            "投影共和国——专为 Minecraft 投影文件设计的分享平台。上传您的精彩作品，发现无限灵感，一键下载复刻，让每一次建筑搭建都更加高效便捷。" /* @TODO l10n */
                        }
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Shadcn.Button asChild size="lg">
                            <Link href="/schematics" className="inline-flex items-center gap-2">
                                <Compass className="h-4 w-4" />
                                {"开始浏览" /* @TODO l10n */}
                            </Link>
                        </Shadcn.Button>
                        <Shadcn.Button asChild size="lg" variant="outline">
                            <Link href="/api-docs" className="inline-flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {"API 文档" /* @TODO l10n */}
                            </Link>
                        </Shadcn.Button>
                        <Shadcn.Button asChild size="lg" variant="outline">
                            <Link href="/about" className="inline-flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {"关于我们" /* @TODO l10n */}
                            </Link>
                        </Shadcn.Button>
                    </div>
                </div>
            </section>

            {/* 脚部 */}
            <Prime.Footer />
        </div>
    );
}
