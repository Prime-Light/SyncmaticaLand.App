"use server";

import { cookies } from "next/headers";
import { ServiceFactory } from "@/services/service-factory";

export interface LoginFormData {
    email: string;
    password: string;
}

export interface User {
    id: number;
    email: string;
    name: string;
}

export async function login(formData: LoginFormData) {
    try {
        const { email, password } = formData;

        if (!email || !password) {
            return { success: false, error: "请填写所有字段" };
        }

        const authService = await ServiceFactory.getAuthService();
        const result = await authService.login(email, password);

        return { success: true, data: result.user };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: error instanceof Error ? error.message : "登录失败" };
    }
}

export async function logout() {
    try {
        const authService = await ServiceFactory.getAuthService();
        await authService.logout();

        return { success: true, message: "已退出登录" };
    } catch (error) {
        console.error("Logout error:", error);
        return { success: false, error: "退出登录失败" };
    }
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const authService = await ServiceFactory.getAuthService();
        const user = await authService.getCurrentUser();
        return user;
    } catch (error) {
        console.error("Get current user error:", error);
        return null;
    }
}
