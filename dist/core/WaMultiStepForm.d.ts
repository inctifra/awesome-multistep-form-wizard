import { WizardEventMap } from '../events/types.js';
import { StepId, ValidationSummary, WizardConfig } from './types.js';
export declare class WaMultiStepForm<TValues extends Record<string, unknown> = Record<string, unknown>> {
    readonly form: HTMLFormElement;
    private readonly config;
    private readonly state;
    private readonly tabs;
    private readonly errorStore;
    private readonly fieldDiscovery;
    private readonly valueReader;
    private readonly asyncManager;
    private readonly validationEngine;
    private readonly events;
    constructor(config: WizardConfig<TValues>);
    on<TKey extends keyof WizardEventMap<TValues>>(event: TKey, handler: (payload: WizardEventMap<TValues>[TKey]) => void): () => void;
    getCurrentStep(): StepId;
    getValues(): TValues;
    getErrors(): import('./types.js').ValidationError[];
    getState(): import('./types.js').WizardState;
    validate(): Promise<ValidationSummary>;
    next(): Promise<void>;
    previous(): void;
    goTo(stepId: StepId, options?: {
        ignoreNavigationRules?: boolean;
    }): void;
    destroy(): void;
    private initialize;
    private bindButtons;
    private enableOnly;
    private canNavigateTo;
    private currentStep;
    private renderErrors;
    private assertUniqueStepIds;
}
//# sourceMappingURL=WaMultiStepForm.d.ts.map