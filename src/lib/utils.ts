import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function safelyGetEnv(key: string) {
    if (!process.env[key]) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return process.env[key];
}