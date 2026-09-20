import { ErrorStore } from "../errors/ErrorStore.js";
import { DefaultErrorRenderer } from "../errors/DefaultErrorRenderer.js";
import { FieldDiscovery } from "../values/FieldDiscovery.js";
import { ValueReader } from "../values/ValueReader.js";
import { AsyncValidationManager } from "../validation/AsyncValidationManager.js";
import { ValidationEngine } from "../validation/ValidationEngine.js";
import { EventEmitter } from "../events/EventEmitter.js";
import type { WizardEventMap } from "../events/types.js";
import { resolveForm } from "./resolve-form.js";
import { WaMultiStepFormError } from "./errors.js";
import { WizardState } from "./WizardState.js";
import type {
  StepId,
  ValidationSummary,
  WizardConfig,
  WizardStep,
} from "./types.js";
import { TabGroupController } from "../navigation/TabGroupController.js";

type FormWizardEventMap<TValues> = WizardEventMap<TValues> &
  Record<string, unknown>;

export class WaMultiStepForm<
  TValues extends Record<string, unknown> =
    Record<string, unknown>
> {
  readonly form: HTMLFormElement;

  private readonly config: WizardConfig<TValues>;
  private readonly state: WizardState;
  private readonly tabs: TabGroupController;
  private readonly errorStore: ErrorStore;
  private readonly fieldDiscovery: FieldDiscovery;
  private readonly valueReader: ValueReader;
  private readonly asyncManager: AsyncValidationManager;
  private readonly validationEngine: ValidationEngine<TValues>;
  private readonly events = new EventEmitter<
    FormWizardEventMap<TValues>
  >();

  constructor(config: WizardConfig<TValues>) {
    if (!config.steps?.length) {
      throw new WaMultiStepFormError(
        "At least one step is required."
      );
    }

    const stepIds = config.steps.map(
      (step) => step.id
    );

    this.assertUniqueStepIds(stepIds);

    this.form = resolveForm(config.form);
    this.config = config;
    this.state = new WizardState(stepIds);

    this.tabs = new TabGroupController(
      this.form,
      stepIds,
      config.selectors?.tabGroup ?? "wa-tab-group"
    );

    this.errorStore = new ErrorStore();
    this.fieldDiscovery = new FieldDiscovery(
      this.form
    );
    this.valueReader = new ValueReader();
    this.asyncManager =
      new AsyncValidationManager();

    this.validationEngine =
      new ValidationEngine<TValues>(
        this.form,
        this.fieldDiscovery,
        this.valueReader,
        this.errorStore,
        this.asyncManager
      );

    this.initialize();
  }

  on<TKey extends keyof WizardEventMap<TValues>>(
    event: TKey,
    handler: (
      payload: WizardEventMap<TValues>[TKey]
    ) => void
  ): () => void {
    return this.events.on(event, handler);
  }

  getCurrentStep(): StepId {
    return this.config.steps[
      this.state.currentStepIndex
    ]!.id;
  }

  getValues(): TValues {
    return this.valueReader.readForm(
      this.form
    ) as TValues;
  }

  getErrors() {
    return this.errorStore.all();
  }

  getState() {
    return this.state.snapshot();
  }

  async validate(): Promise<ValidationSummary> {
    const step = this.currentStep();

    this.events.emit("validation:start", {
      step: step.id,
    });

    const summary =
      await this.validationEngine.validateStep(
        step
      );

    this.renderErrors(step);

    this.state.setValid(
      step.id,
      summary.valid
    );

    this.events.emit("validation:end", {
      step: step.id,
      summary,
    });

    if (summary.valid) {
      this.events.emit("step:valid", {
        step: step.id,
        values: this.getValues(),
      });
    } else {
      this.events.emit("step:invalid", {
        step: step.id,
        errors: summary.errors,
      });
    }

    return summary;
  }

  async next(): Promise<void> {
    const summary = await this.validate();

    if (!summary.valid) {
      return;
    }

    const nextIndex =
      this.state.currentStepIndex + 1;

    if (
      nextIndex >= this.config.steps.length
    ) {
      this.events.emit("complete", {
        values: this.getValues(),
      });

      return;
    }

    const nextStep = this.config.steps[nextIndex];

    if (!nextStep) {
      return;
    }

    this.goTo(nextStep.id);
  }

  previous(): void {
    const previousIndex =
      this.state.currentStepIndex - 1;

    if (previousIndex < 0) {
      return;
    }

    const previousStep =
      this.config.steps[previousIndex];

    if (!previousStep) {
      return;
    }

    this.goTo(previousStep.id, {
      ignoreNavigationRules: true,
    });
  }

  goTo(
    stepId: StepId,
    options: {
      ignoreNavigationRules?: boolean;
    } = {}
  ): void {
    const targetIndex =
      this.config.steps.findIndex(
        (step) => step.id === stepId
      );

    if (targetIndex === -1) {
      throw new WaMultiStepFormError(
        `Unknown step "${stepId}".`
      );
    }

    if (
      !options.ignoreNavigationRules &&
      !this.canNavigateTo(targetIndex)
    ) {
      return;
    }

    const from = this.getCurrentStep();

    this.state.currentStepIndex =
      targetIndex;

    this.state.markVisited(stepId);

    this.tabs.setActive(stepId);

    this.enableOnly(stepId);

    this.events.emit("step:change", {
      from,
      to: stepId,
    });
  }

  destroy(): void {
    this.asyncManager.cancelAll();
    this.events.clear();
  }

  private initialize(): void {
    const firstStep = this.config.steps[0];

    if (!firstStep) {
      throw new WaMultiStepFormError(
        "At least one step is required."
      );
    }

    this.tabs.setActive(firstStep.id);
    this.enableOnly(firstStep.id);
    this.bindButtons();
  }

  private bindButtons(): void {
    const nextSelector =
      this.config.selectors?.next ??
      ".wa-multistep-next";

    const previousSelector =
      this.config.selectors?.previous ??
      ".wa-multistep-previous";

    this.form
      .querySelectorAll(nextSelector)
      .forEach((element) => {
        element.addEventListener("click", (event) => {
          event.preventDefault();
          void this.next();
        });
      });

    this.form
      .querySelectorAll(previousSelector)
      .forEach((element) => {
        element.addEventListener("click", (event) => {
          event.preventDefault();
          this.previous();
        });
      });
  }

  private enableOnly(activeStep: StepId): void {
    for (const step of this.config.steps) {
      this.tabs.disable(
        step.id,
        step.id !== activeStep
      );
    }
  }

  private canNavigateTo(
    targetIndex: number
  ): boolean {
    const currentIndex =
      this.state.currentStepIndex;

    if (targetIndex <= currentIndex) {
      return true;
    }

    const navigation = {
      allowJumpToVisited: false,
      allowJumpToFuture: false,
      ...this.config.navigation,
    };

    if (navigation.allowJumpToFuture) {
      return true;
    }

    if (
      targetIndex > currentIndex + 1 &&
      !navigation.allowJumpToVisited
    ) {
      return false;
    }

    return true;
  }

  private currentStep(): WizardStep<TValues> {
    const step = this.config.steps[
      this.state.currentStepIndex
    ];

    if (!step) {
      throw new WaMultiStepFormError(
        "The current wizard step does not exist."
      );
    }

    return step;
  }

  private renderErrors(
    step: WizardStep<TValues>
  ): void {
    const renderer =
      this.config.errorRenderer ??
      new DefaultErrorRenderer();

    for (const fieldName of step.fields ?? []) {
      const field =
        this.fieldDiscovery.findField(fieldName);

      if (!field) {
        continue;
      }

      const error =
        this.errorStore.getFirst(fieldName);

      if (error) {
        renderer.show(field, error);

        this.events.emit("field:invalid", {
          step: step.id,
          field: fieldName,
          error,
        });
      } else {
        renderer.clear(field);

        this.events.emit("field:valid", {
          step: step.id,
          field: fieldName,
        });
      }
    }
  }

  private assertUniqueStepIds(
    stepIds: StepId[]
  ): void {
    const unique = new Set(stepIds);

    if (unique.size !== stepIds.length) {
      throw new WaMultiStepFormError(
        "Step IDs must be unique."
      );
    }
  }
}