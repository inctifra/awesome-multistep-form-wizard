import { ValidationSummary, WizardStep } from '../core/types.js';
import { ErrorStore } from '../errors/ErrorStore.js';
import { FieldDiscovery } from '../values/FieldDiscovery.js';
import { ValueReader } from '../values/ValueReader.js';
import { AsyncValidationManager } from './AsyncValidationManager.js';
export declare class ValidationEngine<TValues extends Record<string, unknown>> {
    private readonly form;
    private readonly fieldDiscovery;
    private readonly valueReader;
    private readonly errorStore;
    private readonly asyncManager;
    constructor(form: HTMLFormElement, fieldDiscovery: FieldDiscovery, valueReader: ValueReader, errorStore: ErrorStore, asyncManager: AsyncValidationManager);
    validateStep(step: WizardStep<TValues>): Promise<ValidationSummary>;
    private runValidator;
    private toError;
    private finish;
}
//# sourceMappingURL=ValidationEngine.d.ts.map