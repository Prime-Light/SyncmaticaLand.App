// lib/logger.ts
type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMeta {
    [key: string]: unknown;
}

/**
 * 日志记录器
 * @param serviceName 服务名称
 */
export class Logger {
    private serviceName: string;

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    private format(level: LogLevel, message: string, meta?: LogMeta) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] ${this.serviceName} ${message}\n\n  - Meta: ${JSON.stringify(meta)}`;
    }

    /**
     * 记录信息日志
     * @param message 信息消息
     * @param meta 元数据
     */
    info(message: string, meta?: LogMeta) {
        console.log(this.format("info", message, meta));
    }

    /**
     * 记录警告日志
     * @param message 警告消息
     * @param meta 元数据
     */
    warn(message: string, meta?: LogMeta) {
        console.warn(this.format("warn", message, meta));
    }

    /**
     * 记录错误日志
     * @param message 错误消息
     * @param meta 元数据
     * @param rethrow 是否重新抛出错误（谨慎使用，如果未处理错误会导致冒泡到顶层）[default: false]
     */
    error(message: string, meta?: LogMeta, rethrow: boolean = false) {
        console.error(this.format("error", message, meta));
        if (rethrow) {
            const receivedErr = meta ? meta["err"] || meta["error"] || null : null;
            throw receivedErr || new Error(message);
        }
    }

    /**
     * 记录调试日志
     * @param message 调试消息
     * @param meta 元数据
     */
    debug(message: string, meta?: LogMeta) {
        if (process.env.NODE_ENV !== "production") {
            console.debug(this.format("debug", message, meta));
        }
    }
}
