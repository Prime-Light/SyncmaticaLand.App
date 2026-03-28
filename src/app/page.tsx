import { Navbar } from "@/components/@prime-light/navbar"
import { Radix } from "@/components"

export default function Page() {
    return (
        <div className="flex min-h-svh flex-col">
            <Navbar />
            <main className="flex flex-1 flex-col items-center justify-center p-6">
                <div className="flex max-w-md min-w-0 flex-col gap-4 text-center text-sm leading-loose">
                    <div>
                        <h1 className="font-medium">Project ready!</h1>
                        <p>You may now add components and start building.</p>
                        <p>We&apos;ve already added the button component for you.</p>
                        <Radix.Button className="mt-2">Button</Radix.Button>
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                        (Press <kbd>d</kbd> to toggle dark mode)
                    </div>
                </div>
            </main>
        </div>
    )
}
