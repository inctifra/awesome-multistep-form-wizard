import { StepId, WizardState as State } from './types.js';
export declare class WizardState {
    private readonly state;
    constructor(stepIds: StepId[]);
    get currentStepIndex(): number;
    set currentStepIndex(index: number);
    markVisited(stepId: StepId): void;
    isVisited(stepId: StepId): boolean;
    setValid(stepId: StepId, valid: boolean): void;
    isValid(stepId: StepId): boolean;
    snapshot(): State;
}
//# sourceMappingURL=WizardState.d.ts.map