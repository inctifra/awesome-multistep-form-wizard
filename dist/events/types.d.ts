import { FieldName, StepId, ValidationError, ValidationSummary } from '../core/types.js';
export interface WizardEventMap<TValues = Record<string, unknown>> {
    "step:change": {
        from: StepId;
        to: StepId;
    };
    "validation:start": {
        step: StepId;
    };
    "validation:end": {
        step: StepId;
        summary: ValidationSummary;
    };
    "step:valid": {
        step: StepId;
        values: TValues;
    };
    "step:invalid": {
        step: StepId;
        errors: ValidationError[];
    };
    "field:invalid": {
        step: StepId;
        field: FieldName;
        error: ValidationError;
    };
    "field:valid": {
        step: StepId;
        field: FieldName;
    };
    complete: {
        values: TValues;
    };
    error: {
        error: unknown;
    };
}
//# sourceMappingURL=types.d.ts.map