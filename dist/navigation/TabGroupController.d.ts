import { StepId } from '../core/types.js';
export interface TabElements {
    tab: HTMLElement;
    panel: HTMLElement;
}
export declare class TabGroupController {
    readonly form: HTMLFormElement;
    readonly tabGroup: HTMLElement;
    private readonly tabs;
    constructor(form: HTMLFormElement, stepIds: StepId[], selector?: string);
    getStepElements(stepId: StepId): TabElements;
    setActive(stepId: StepId): void;
    disable(stepId: StepId, disabled?: boolean): void;
    private resolveStepElements;
}
//# sourceMappingURL=TabGroupController.d.ts.map