import { escapeCss } from "../core/css.js";
import { WaMultiStepFormError } from "../core/errors.js";
import type { StepId } from "../core/types.js";

export interface TabElements {
  tab: HTMLElement;
  panel: HTMLElement;
}

export class TabGroupController {
  readonly form: HTMLFormElement;
  readonly tabGroup: HTMLElement;

  private readonly tabs = new Map<StepId, TabElements>();

  constructor(
    form: HTMLFormElement,
    stepIds: StepId[],
    selector = "wa-tab-group",
  ) {
    this.form = form;

    const tabGroup = form.querySelector(selector);

    if (!(tabGroup instanceof HTMLElement)) {
      throw new WaMultiStepFormError(
        `No ${selector} was found inside the configured form.`,
      );
    }

    this.tabGroup = tabGroup;

    for (const stepId of stepIds) {
      this.tabs.set(stepId, this.resolveStepElements(stepId));
    }
  }

  getStepElements(stepId: StepId): TabElements {
    const elements = this.tabs.get(stepId);

    if (!elements) {
      throw new WaMultiStepFormError(`Unknown step "${stepId}".`);
    }

    return elements;
  }

  setActive(stepId: StepId): void {
    this.getStepElements(stepId);

    const tabGroupWithActive = this.tabGroup as HTMLElement & {
      active?: string;
    };

    tabGroupWithActive.active = stepId;
  }

  disable(stepId: StepId, disabled = true): void {
    const { tab } = this.getStepElements(stepId);

    const tabWithDisabled = tab as HTMLElement & {
      disabled?: boolean;
    };

    tabWithDisabled.disabled = disabled;
  }

  private resolveStepElements(stepId: StepId): TabElements {
    const escapedId = escapeCss(stepId);

    const tab = this.form.querySelector(`wa-tab[panel="${escapedId}"]`);

    if (!(tab instanceof HTMLElement)) {
      throw new WaMultiStepFormError(
        `No <wa-tab panel="${stepId}"> was found.`,
      );
    }

    const panel = this.form.querySelector(`wa-tab-panel[name="${escapedId}"]`);

    if (!(panel instanceof HTMLElement)) {
      throw new WaMultiStepFormError(
        `No <wa-tab-panel name="${stepId}"> was found.`,
      );
    }

    return { tab, panel };
  }
}
