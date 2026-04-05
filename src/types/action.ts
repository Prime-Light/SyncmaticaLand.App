export type ActionResult = {
    success: boolean;
    message?: string; // 全局提示
    fieldErrors?: Record<string, unknown>; // 字段错误
};
