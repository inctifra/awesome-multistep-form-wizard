export type EventHandler<T> = (payload: T) => void;
export declare class EventEmitter<TEvents extends Record<string, unknown>> {
    private readonly listeners;
    on<TKey extends keyof TEvents>(event: TKey, handler: EventHandler<TEvents[TKey]>): () => void;
    emit<TKey extends keyof TEvents>(event: TKey, payload: TEvents[TKey]): void;
    clear(): void;
}
//# sourceMappingURL=EventEmitter.d.ts.map