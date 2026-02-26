"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
    return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid w-full gap-2", className)} {...props} />;
}

const Variants = {
    default:
        "border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:aria-invalid:border-destructive/50 group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3",
    button: "px-2 py-1.5 text-sm font-medium rounded-sm cursor-pointer transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/70 dark:hover:text-foreground data-[state=checked]:bg-background data-[state=checked]:text-foreground data-[state=checked]:shadow-sm data-[state=checked]:dark:bg-muted-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    buttonPrimary: "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-sm transition-all hover:bg-muted hover:text-foreground dark:hover:bg-muted/60 data-[state=checked]:bg-primary/25 dark:hover:data-[state=checked]:bg-primary/15 data-[state=checked]:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
};

function RadioGroupItem({
    className,
    variant = "default",
    children,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & { variant?: keyof typeof Variants }) {
    return (
        <RadioGroupPrimitive.Item data-slot="radio-group-item" className={cn(Variants[variant], className)} {...props}>
            {children || (
                <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className="flex size-4 items-center justify-center">
                    <span className="bg-primary-foreground absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
                </RadioGroupPrimitive.Indicator>
            )}
        </RadioGroupPrimitive.Item>
    );
}

export { RadioGroup, RadioGroupItem };
