import type {
  FieldName,
  ValidationError,
  ValidationFailure,
  ValidationResult,
  ValidationStatus,
  ValidationSummary,
  ValidatorConfig,
  WizardStep,
} from "../core/types.js";
import { ErrorStore } from "../errors/ErrorStore.js";
import { FieldDiscovery } from "../values/FieldDiscovery.js";
import { ValueReader } from "../values/ValueReader.js";
import { AsyncValidationManager } from "./AsyncValidationManager.js";

export class ValidationEngine<TValues extends Record<string, unknown>> {
  constructor(
    private readonly form: HTMLFormElement,
    private readonly fieldDiscovery: FieldDiscovery,
    private readonly valueReader: ValueReader,
    private readonly errorStore: ErrorStore,
    private readonly asyncManager: AsyncValidationManager,
  ) {}

  async validateStep(step: WizardStep<TValues>): Promise<ValidationSummary> {
    const fields = this.fieldDiscovery.findStepFields(
      step as unknown as WizardStep<Record<string, unknown>>,
    );

    const values = {
      ...this.valueReader.readForm(this.form),
    } as TValues;

    const errors: ValidationError[] = [];

    const missingFields = this.fieldDiscovery.findMissingFields(
      step as unknown as WizardStep<Record<string, unknown>>,
    );

    for (const field of missingFields) {
      errors.push({
        field,
        message: `Field "${field}" was not found.`,
        source: "system",
      });
    }

    if (missingFields.length > 0) {
      return this.finish(step, errors, "invalid");
    }

    for (const validator of step.validators ?? []) {
      const result = await this.runValidator(step, validator, fields, values);

      if (!result.valid && result.status === "aborted") {
        continue;
      }

      if (!result.valid) {
        errors.push(this.toError(validator, result, step));
      }
    }

    for (const fieldName of step.fields ?? []) {
      const fieldErrors = errors.filter((error) => error.field === fieldName);

      this.errorStore.set(fieldName, fieldErrors);
    }

    return this.finish(step, errors, errors.length === 0 ? "valid" : "invalid");
  }

  private async runValidator(
    step: WizardStep<TValues>,
    validator: ValidatorConfig<TValues>,
    fields: HTMLElement[],
    values: TValues,
  ): Promise<ValidationResult> {
    const key = [
      "step",
      step.id,
      validator.name ?? "anonymous",
      ...(validator.fields ?? []),
    ].join(":");

    const { signal, runId } = this.asyncManager.begin(key);

    const selectedFields =
      validator.fields?.flatMap((name) => {
        const field = this.fieldDiscovery.findField(name);

        return field ? [field] : [];
      }) ?? fields;

    const firstField = selectedFields[0];

    try {
      const result = await validator.validate({
        value: firstField ? this.valueReader.read(firstField) : undefined,
        values,
        field: firstField!,
        fields: selectedFields,
        form: this.form,
        step,
        signal,
      });

      if (!this.asyncManager.isCurrent(key, runId)) {
        return {
          valid: false,
          status: "aborted",
          message: "",
        };
      }

      return result;
    } catch (error) {
      if (signal.aborted) {
        return {
          valid: false,
          status: "aborted",
        };
      }

      return {
        valid: false,
        status: "error",
        source: "system",
        message: error instanceof Error ? error.message : "Validation failed.",
      };
    }
  }

  private toError(
  validator: ValidatorConfig<TValues>,
  result: ValidationFailure,
  step: WizardStep<TValues>,
): ValidationError {
  const field =
    validator.fields?.[0] ??
    step.fields?.[0] ??
    "__step__";

  return {
    field,
    message: result.message,
    ...(result.code
      ? { code: result.code }
      : {}),
    source:
      result.source ??
      validator.source ??
      "custom",
  };
}

  private finish(
    step: WizardStep<TValues>,
    errors: ValidationError[],
    status: ValidationStatus,
  ): ValidationSummary {
    return {
      valid: errors.length === 0,
      errors,
      status,
    };
  }
}
