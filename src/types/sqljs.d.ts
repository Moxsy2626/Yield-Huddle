declare module 'sql.js' {
  export interface SQLDatabase {
    exec(sql: string, params?: unknown[]): Array<{ columns: string[]; values: unknown[][] }>;
    run(sql: string, params?: unknown[]): void;
    prepare(sql: string): {
      step: () => boolean;
      get: () => unknown[];
      free: () => void;
      bind?: (params: unknown[]) => void;
    };
    export(): Uint8Array;
  }
  export interface SQLStatic {
    Database: new (data?: Uint8Array) => SQLDatabase;
  }
  const initSqlJs: (cfg: { locateFile: (file: string) => string }) => Promise<SQLStatic>;
  export default initSqlJs;
}
