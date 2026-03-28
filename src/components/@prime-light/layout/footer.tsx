import Link from "next/link";
import { Shadcn } from "@/components";
import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
    return (
        <footer className={cn("border-t py-4 sm:py-6", className)}>
            <div className="px-4 md:px-6 lg:px-12">
                <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-between">
                    <p className="text-center text-xs text-muted-foreground sm:text-left sm:text-sm">
                        © 2025~{new Date().getFullYear()} SyncmaticaLand 投影共和国
                    </p>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                        Made by{" "}
                        <Shadcn.Button variant="link" className="-mx-2 text-sm">
                            <Link href="https://github.com/Prime-Light">Prime-Light Team</Link>
                        </Shadcn.Button>
                    </p>
                </div>
            </div>
        </footer>
    );
}
