import { Client } from "node-appwrite";

type ClientOptions = { type: "admin"; apiKey: string } | { type: "session"; session: string };

export function createAppwriteClient(options: ClientOptions) {
    const client = new Client().setEndpoint(process.env.APPWRITE_ENDPOINT!).setProject(process.env.APPWRITE_PROJECT_ID!);

    if (options.type === "admin") {
        client.setKey(options.apiKey);
    } else {
        client.setSession(options.session);
    }

    return client;
}

import { Account, TablesDB } from "node-appwrite";

export function createServices(client: Client) {
    return {
        account: new Account(client),
        tablesDB: new TablesDB(client),
    };
}
