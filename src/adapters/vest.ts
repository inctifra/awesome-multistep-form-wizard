import type { ValidationResult, Validator } from "../core/types.js";

interface VestResult {
  hasErrors?: (field?: string) => boolean;
  getErrors?: (field?: string) => string[];
  errorCount?: number;
}

interface VestSuite<TValues> {
  run(
    data: TValues,
    options?: {
      signal?: AbortSignal;
    },
  ): VestResult | Promise<VestResult>;
}

export interface VestValidatorOptions<TValues> {
  suite: VestSuite<TValues>| any;
  field?: string;
}

export function vestValidator<TValues>(
  options: VestValidatorOptions<TValues>,
): Validator<TValues> {
  return async ({ values, signal }) => {
    const result = await options.suite.run(values, { signal });

    const hasErrors = options.field
      ? result.hasErrors?.(options.field) === true
      : result.hasErrors?.() === true || (result.errorCount ?? 0) > 0;

    if (!hasErrors) {
      return {
        valid: true,
      };
    }

    const message = options.field
      ? result.getErrors?.(options.field)?.[0]
      : result.getErrors?.()?.[0];

    return {
      valid: false,
      message: message ?? "Validation failed.",
      source: "vest",
    };
  };
}
