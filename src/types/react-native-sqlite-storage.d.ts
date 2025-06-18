declare module 'react-native-sqlite-storage' {
    export interface SQLiteDatabase {
        transaction: (callback: (tx: SQLiteTransaction) => void) => Promise<void>;
        executeSql: (sql: string, params?: any[]) => Promise<[SQLiteResultSet]>;
        close: () => Promise<void>;
    }

    export interface SQLiteTransaction {
        executeSql: (sql: string, params?: any[]) => Promise<[SQLiteResultSet]>;
    }

    export interface SQLiteResultSet {
        rows: {
            length: number;
            item: (index: number) => any;
        };
        insertId?: number;
    }

    export function openDatabase(params: {
        name: string;
        location?: string;
    }): Promise<SQLiteDatabase>;

    export function enablePromise(enable: boolean): void;
} 