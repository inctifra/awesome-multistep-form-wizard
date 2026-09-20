import type { ValidationResult, Validator } from "../core/types.js";

export interface BackendRequestContext<TValues> {
  value: unknown;
  values: TValues;
  signal: AbortSignal;
}

export interface BackendUrlValidatorOptions<TValues> {
  url: string;
  method?: string;
  headers?:
    | HeadersInit
    | ((context: BackendRequestContext<TValues>) => HeadersInit);
  body?: (context: BackendRequestContext<TValues>) => unknown;
  parseResponse?: (
    data: unknown,
    response: Response,
  ) => ValidationResult | Promise<ValidationResult>;
}

export function backendUrlValidator<TValues>(
  options: BackendUrlValidatorOptions<TValues>,
): Validator<TValues> {
  return async ({ value, values, signal }) => {
    const context = {
      value,
      values,
      signal,
    };

    const headers =
      typeof options.headers === "function"
        ? options.headers(context)
        : (options.headers ?? {
            "Content-Type": "application/json",
          });

    const response = await fetch(options.url, {
      method: options.method ?? "POST",
      headers,
      body: JSON.stringify(
        options.body?.(context) ?? {
          value,
          values,
        },
      ),
      signal,
    });

    if (!response.ok) {
      throw new Error(
        `Validation request failed with status ${response.status}.`,
      );
    }

    const data = await response.json();

    if (options.parseResponse) {
      return options.parseResponse(data, response);
    }

    const result = data as {
      valid?: boolean;
      message?: string;
    };

    return result.valid
      ? { valid: true, status: "valid" }
      : {
          valid: false,
          message: result.message ?? "The value is invalid.",
          source: "backend",
        };
  };
}
