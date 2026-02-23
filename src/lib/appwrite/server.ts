import "server-only";

import { Account, Client, Users } from "node-appwrite";

function readRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing env: ${name}`);
    }
    return value;
}

function readBaseConfig() {
    const endpoint = readRequiredEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT");
    const projectId = readRequiredEnv("NEXT_PUBLIC_APPWRITE_PROJECT");
    return { endpoint, projectId };
}

export function getSessionCookieName(projectId?: string): string {
    const effectiveProjectId = projectId ?? readRequiredEnv("NEXT_PUBLIC_APPWRITE_PROJECT");
    return `a_session_${effectiveProjectId}`;
}

export function createAdminClient() {
    const { endpoint, projectId } = readBaseConfig();
    const apiKey = readRequiredEnv("APPWRITE_API_KEY");

    const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);

    return {
        client,
        projectId,
        account: new Account(client),
        users: new Users(client),
    };
}

export function createSessionClient(sessionSecret?: string) {
    const { endpoint, projectId } = readBaseConfig();
    const client = new Client().setEndpoint(endpoint).setProject(projectId);

    if (sessionSecret) {
        client.setSession(sessionSecret);
    }

    return {
        client,
        projectId,
        account: new Account(client),
    };
}
