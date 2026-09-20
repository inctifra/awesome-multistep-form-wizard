export type FormReference = string | HTMLFormElement;

export type StepId = string;

export type FieldName = string;

export type ValidationStatus = "valid" | "invalid" | "aborted" | "error";

export interface ValidationSuccess {
  valid: true;
  status?: "valid";
}

export interface ValidationFailure {
  valid: false;
  message: string;
  code?: string;
  source?: ValidationSource;
  status?: Exclude<ValidationStatus, "valid">;
}

export type ValidationResult =
  | ValidationSuccess
  | ValidationFailure
  | ValidationAborted;

export interface ValidationError {
  field: FieldName;
  message: string;
  code?: string;
  source?: ValidationSource;
}

export interface ValidationAborted {
  valid: false;
  status: "aborted";
}

export interface ValidationSummary {
  valid: boolean;
  errors: ValidationError[];
  status: ValidationStatus;
}

export interface ValidationContext<TValues = Record<string, unknown>> {
  value?: unknown;
  values: TValues;
  field?: HTMLElement;
  fields: HTMLElement[];
  form: HTMLFormElement;
  step: WizardStep<TValues>;
  signal: AbortSignal;
}

export type Validator<TValues = Record<string, unknown>> = (
  context: ValidationContext<TValues>,
) => ValidationResult | Promise<ValidationResult>;

export interface ValidatorConfig<TValues = Record<string, unknown>> {
  name?: string;
  fields?: FieldName[];
  validate: Validator<TValues>;
  source?: ValidationSource;
}

export interface WizardStep<TValues = Record<string, unknown>> {
  id: StepId;
  fields?: FieldName[] | undefined;
  validators?: ValidatorConfig<TValues>[] | undefined;
  schema?: unknown;
}

export interface NavigationOptions {
  allowJumpToVisited?: boolean;
  allowJumpToFuture?: boolean;
}

export interface SelectorOptions {
  tabGroup?: string;
  next?: string;
  previous?: string;
}

export interface ErrorRenderer {
  show(field: HTMLElement, error: ValidationError): void;

  clear(field: HTMLElement): void;
}

export interface WizardConfig<TValues = Record<string, unknown>> {
  form: FormReference;
  steps: WizardStep<TValues>[];
  selectors?: SelectorOptions;
  navigation?: NavigationOptions;
  errorRenderer?: ErrorRenderer;
}

export interface WizardState {
  currentStepIndex: number;
  visited: Set<StepId>;
  valid: Map<StepId, boolean>;
}
export type ValidationSource =
  | "schema"
  | "custom"
  | "backend"
  | "vest"
  | "system";
