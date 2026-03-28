// lib/logger.ts
type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMeta {
    [key: string]: unknown;
}

export class Logger {
    private serviceName: string;

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    private format(level: LogLevel, message: string, meta?: LogMeta) {
        const timestamp = new Date().toISOString();
        return JSON.stringify({
            timestamp,
            level,
            service: this.serviceName,
            message,
            ...meta,
        });
    }

    info(message: string, meta?: LogMeta) {
        console.log(this.format("info", message, meta));
    }

    warn(message: string, meta?: LogMeta) {
        console.warn(this.format("warn", message, meta));
    }

    error(message: string, meta?: LogMeta, rethrow: boolean = true) {
        console.error(this.format("error", message, meta));
        if (rethrow) {
            const receivedErr = meta ? meta["err"] || meta["error"] || null : null;
            throw receivedErr || new Error(message);
        }
    }

    debug(message: string, meta?: LogMeta) {
        if (process.env.NODE_ENV !== "production") {
            console.debug(this.format("debug", message, meta));
        }
    }
}
