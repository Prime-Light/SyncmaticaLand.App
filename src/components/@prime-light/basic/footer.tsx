import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t py-6 sm:py-8">
            <div className="px-4 md:px-6 lg:px-12">
                <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-between">
                    <p className="text-muted-foreground text-center text-xs sm:text-left sm:text-sm">
                        © 2025~{new Date().getFullYear()} SyncmaticaLand 投影共和国
                    </p>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                        Made by <Link href="https://github.com/Prime-Light">Prime-Light Team</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}
