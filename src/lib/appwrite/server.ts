import { createAppwriteClient, createServices } from "./index";

export function createAdminClient() {
    const client = createAppwriteClient({
        type: "admin",
        apiKey: process.env.APPWRITE_SECRET!,
    });

    return {
        client,
        ...createServices(client),
        projectId: process.env.APPWRITE_PROJECT_ID!,
    };
}

export function createSessionClient(sessionSecret: string) {
    const client = createAppwriteClient({
        type: "session",
        session: sessionSecret,
    });

    return {
        client,
        ...createServices(client),
    };
}

export function getSessionCookieName(projectId?: string): string {
    return `a_session_${projectId || process.env.APPWRITE_PROJECT_ID!}`;
}
