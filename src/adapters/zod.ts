import type { ValidationResult, Validator, WizardStep } from "../core/types.js";

interface ZodLikeError {
  issues: Array<{
    path: PropertyKey[];
    message: string;
    code?: string;
  }>;
}

interface ZodLikeSchema<TValues> {
  safeParse(values: unknown):
    | {
        success: true;
        data: TValues;
      }
    | {
        success: false;
        error: ZodLikeError;
      };
}

export interface ZodValidatorOptions<TValues> {
  schema: ZodLikeSchema<TValues>;
}

export function zodValidator<TValues>(
  options: ZodValidatorOptions<TValues>,
): Validator<TValues> {
  return ({ values }) => {
    const result = options.schema.safeParse(values);

    if (result.success) {
      return {
        valid: true,
      };
    }

    const firstIssue = result.error.issues[0];

    if (!firstIssue) {
      return {
        valid: false,
        message: "Form validation failed.",
        source: "schema",
      };
    }

    return {
      valid: false,
      message: firstIssue.message,
      source: "schema",
      ...(firstIssue.code ? { code: firstIssue.code } : {}),
    };
  };
}
