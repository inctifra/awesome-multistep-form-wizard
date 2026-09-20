import type { StepId, WizardState as State } from "./types.js";

export class WizardState {
  private readonly state: State;

  constructor(stepIds: StepId[]) {
    const firstStep = stepIds[0];

    if (!firstStep) {
      throw new Error("At least one wizard step is required.");
    }

    this.state = {
      currentStepIndex: 0,
      visited: new Set([firstStep]),
      valid: new Map(stepIds.map((stepId) => [stepId, false])),
    };
  }

  get currentStepIndex(): number {
    return this.state.currentStepIndex;
  }

  set currentStepIndex(index: number) {
    this.state.currentStepIndex = index;
  }

  markVisited(stepId: StepId): void {
    this.state.visited.add(stepId);
  }

  isVisited(stepId: StepId): boolean {
    return this.state.visited.has(stepId);
  }

  setValid(stepId: StepId, valid: boolean): void {
    this.state.valid.set(stepId, valid);
  }

  isValid(stepId: StepId): boolean {
    return this.state.valid.get(stepId) === true;
  }

  snapshot(): State {
    return {
      currentStepIndex: this.state.currentStepIndex,
      visited: new Set(this.state.visited),
      valid: new Map(this.state.valid),
    };
  }
}
