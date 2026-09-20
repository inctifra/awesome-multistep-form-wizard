export type EventHandler<T> = (payload: T) => void;

export class EventEmitter<TEvents extends Record<string, unknown>> {
  private readonly listeners = new Map<
    keyof TEvents,
    Set<EventHandler<unknown>>
  >();

  on<TKey extends keyof TEvents>(
    event: TKey,
    handler: EventHandler<TEvents[TKey]>,
  ): () => void {
    const listeners =
      this.listeners.get(event) ?? new Set<EventHandler<unknown>>();
    listeners.add(handler as EventHandler<unknown>);
    this.listeners.set(event, listeners);
    return () => {
      listeners.delete(handler as EventHandler<unknown>);
    };
  }

  emit<TKey extends keyof TEvents>(event: TKey, payload: TEvents[TKey]): void {
    const listeners = this.listeners.get(event);
    if (!listeners) {
      return;
    }
    for (const handler of listeners) {
      handler(payload);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
