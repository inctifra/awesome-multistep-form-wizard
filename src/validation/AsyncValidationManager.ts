export class AsyncValidationManager {
  private readonly controllers = new Map<string, AbortController>();

  private readonly runIds = new Map<string, number>();

  begin(key: string): {
    signal: AbortSignal;
    runId: number;
  } {
    this.controllers.get(key)?.abort();

    const controller = new AbortController();
    const runId = (this.runIds.get(key) ?? 0) + 1;

    this.controllers.set(key, controller);
    this.runIds.set(key, runId);

    return {
      signal: controller.signal,
      runId,
    };
  }

  isCurrent(key: string, runId: number): boolean {
    return this.runIds.get(key) === runId;
  }

  cancel(key: string): void {
    this.controllers.get(key)?.abort();
    this.controllers.delete(key);
  }

  cancelAll(): void {
    for (const controller of this.controllers.values()) {
      controller.abort();
    }

    this.controllers.clear();
  }
}
