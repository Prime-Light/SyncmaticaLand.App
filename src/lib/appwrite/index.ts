import { Client, Account, Databases } from "node-appwrite";

class AppwriteClient {
    private static instance: AppwriteClient;
    private client: Client;
    public account: Account;
    public databases: Databases;

    private constructor(apiKey?: string) {
        let client = new Client().setEndpoint(process.env.APPWRITE_ENDPOINT!).setProject(process.env.APPWRITE_PROJECT_ID!);

        const key = apiKey || process.env.APPWRITE_API_KEY;
        if (key) {
            client = client.setKey(key);
        }

        this.client = client;

        // 初始化你需要用的服务
        this.account = new Account(this.client);
        this.databases = new Databases(this.client);
    }

    // 获取单例
    public static getInstance(apiKey?: string): AppwriteClient {
        if (!AppwriteClient.instance) {
            AppwriteClient.instance = new AppwriteClient(apiKey);
        }
        return AppwriteClient.instance;
    }

    // 对外提供 client 访问
    public getClient(): Client {
        return this.client;
    }
}

export default AppwriteClient;
