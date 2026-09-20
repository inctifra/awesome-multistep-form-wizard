import { FieldName, WizardStep } from '../core/types.js';
export declare class FieldDiscovery {
    private readonly form;
    constructor(form: HTMLFormElement);
    findField(name: FieldName): HTMLElement | null;
    findStepFields(step: WizardStep): HTMLElement[];
    findMissingFields(step: WizardStep): FieldName[];
    private escapeAttribute;
}
//# sourceMappingURL=FieldDiscovery.d.ts.map