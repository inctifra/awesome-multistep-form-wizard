import { FieldName, ValidationError } from '../core/types.js';
export declare class ErrorStore {
    private readonly errors;
    set(field: FieldName, errors: ValidationError[]): void;
    add(error: ValidationError): void;
    get(field: FieldName): ValidationError[];
    getFirst(field: FieldName): ValidationError | undefined;
    has(field: FieldName): boolean;
    clear(field?: FieldName): void;
    all(): ValidationError[];
    forFields(fields: FieldName[]): ValidationError[];
}
//# sourceMappingURL=ErrorStore.d.ts.map