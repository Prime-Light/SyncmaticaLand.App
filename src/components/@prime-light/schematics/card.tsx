import Image from "next/image";
import { Heart, Eye, Download } from "lucide-react";
import { Shadcn } from "@/components";

export interface SchematicCardProps {
    id: string;
    title: string;
    description: string;
    author: string;
    likes: number;
    downloads: number;
    views: number;
    imageUrl?: string;
}

export function SchematicCard({
    title,
    description,
    author,
    likes,
    downloads,
    views,
    imageUrl,
}: SchematicCardProps) {
    return (
        <Shadcn.Card className="group overflow-hidden border-0 shadow-sm">
            {/* Image Container */}
            <div className="relative -mx-6 -mt-6 aspect-video overflow-hidden rounded-xl bg-muted">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted/80 to-muted">
                        <span className="text-sm text-muted-foreground">原理图预览</span>
                    </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background/80 via-background/40 to-transparent" />
            </div>

            {/* Content */}
            <Shadcn.CardHeader className="space-y-2 p-4 pt-3">
                <Shadcn.CardTitle className="line-clamp-1 text-base font-semibold">
                    {title}
                </Shadcn.CardTitle>
                <Shadcn.CardDescription className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                </Shadcn.CardDescription>
            </Shadcn.CardHeader>

            {/* Footer with Author and Stats */}
            <Shadcn.CardFooter className="flex items-center justify-between border-0 bg-transparent p-4 pt-3">
                <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-xs font-medium text-primary">
                            {author.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{author}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Heart className="size-4" />
                        <span className="text-xs">
                            {likes > 999 ? `${(likes / 1000).toFixed(1)}k` : likes}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Download className="size-4" />
                        <span className="text-xs">
                            {downloads > 999 ? `${(downloads / 1000).toFixed(1)}k` : downloads}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Eye className="size-4" />
                        <span className="text-xs">
                            {views > 999 ? `${(views / 1000).toFixed(1)}k` : views}
                        </span>
                    </div>
                </div>
            </Shadcn.CardFooter>
        </Shadcn.Card>
    );
}
