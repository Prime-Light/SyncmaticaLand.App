"use server";
import { Client, ID, Users } from "node-appwrite";

export type SignupActionState = {
    success: boolean;
    messageKey: "missing_fields" | "signup_success" | "signup_failed" | "";
};

export async function signupAction(_prevState: SignupActionState, formData: FormData): Promise<SignupActionState> {
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!name || !email || !password) {
        return {
            success: false,
            messageKey: "missing_fields",
        };
    }

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!endpoint || !projectId || !apiKey) {
        return {
            success: false,
            messageKey: "signup_failed",
        };
    }

    const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
    const users = new Users(client);

    try {
        await users.create({
            userId: ID.unique(),
            name,
            email,
            password,
        });

        return {
            success: true,
            messageKey: "signup_success",
        };
    } catch {
        return {
            success: false,
            messageKey: "signup_failed",
        };
    }
}
