export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
export const USERS_COLLECTION_ID = process.env.APPWRITE_USERS_TABLE_ID!;

export enum AccountStatus {
    NORMAL = "NORMAL",
    BANNED = "BANNED",
    SUSPENDED = "SUSPENDED",
}

export type UserDocument = {
    $id: string;
    $sequence: number;
    $tableId: string;
    $databaseId: string;
    $permissions: string[];
    account_status: AccountStatus;
    banned_reason?: string;
    uid: string;
    schematics?: string;
    $createdAt: string;
    $updatedAt: string;
};
