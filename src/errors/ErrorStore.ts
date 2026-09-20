import type { FieldName, ValidationError } from "../core/types.js";

export class ErrorStore {
  private readonly errors = new Map<FieldName, ValidationError[]>();

  set(field: FieldName, errors: ValidationError[]): void {
    if (errors.length === 0) {
      this.errors.delete(field);
      return;
    }

    this.errors.set(field, errors);
  }

  add(error: ValidationError): void {
    const existing = this.errors.get(error.field) ?? [];

    this.errors.set(error.field, [...existing, error]);
  }

  get(field: FieldName): ValidationError[] {
    return [...(this.errors.get(field) ?? [])];
  }

  getFirst(field: FieldName): ValidationError | undefined {
    return this.errors.get(field)?.[0];
  }

  has(field: FieldName): boolean {
    return this.errors.has(field);
  }

  clear(field?: FieldName): void {
    if (field) {
      this.errors.delete(field);
      return;
    }

    this.errors.clear();
  }

  all(): ValidationError[] {
    return Array.from(this.errors.values()).flat();
  }

  forFields(fields: FieldName[]): ValidationError[] {
    const names = new Set(fields);

    return this.all().filter((error) => names.has(error.field));
  }
}
