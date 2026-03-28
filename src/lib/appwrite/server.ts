import AppwriteClient from "./index";

export function createAdminClient() {
    const appwriteClient = AppwriteClient.getInstance(process.env.APPWRITE_API_KEY!);

    return {
        client: appwriteClient.getClient(),
        account: appwriteClient.account,
        databases: appwriteClient.databases,
        projectId: process.env.APPWRITE_PROJECT_ID!,
    };
}

export function createSessionClient(sessionSecret: string) {
    const appwriteClient = AppwriteClient.getInstance();
    const client = appwriteClient.getClient();
    client.setSession(sessionSecret);

    return {
        client,
        account: appwriteClient.account,
        databases: appwriteClient.databases,
    };
}

export function getSessionCookieName(projectId?: string): string {
    return `a_session_${projectId || process.env.APPWRITE_PROJECT_ID!}`;
}
