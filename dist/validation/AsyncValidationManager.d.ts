export declare class AsyncValidationManager {
    private readonly controllers;
    private readonly runIds;
    begin(key: string): {
        signal: AbortSignal;
        runId: number;
    };
    isCurrent(key: string, runId: number): boolean;
    cancel(key: string): void;
    cancelAll(): void;
}
//# sourceMappingURL=AsyncValidationManager.d.ts.map