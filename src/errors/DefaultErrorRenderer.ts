import type { ErrorRenderer, ValidationError } from "../core/types.js";

export class DefaultErrorRenderer implements ErrorRenderer {
  show(field: HTMLElement, error: ValidationError): void {
    field.setAttribute("data-invalid", "");
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("data-validation-message", error.message);
    const element = field as HTMLElement & { helpText?: string };
    if ("helpText" in element) {
      element.helpText = error.message;
    }
  }

  clear(field: HTMLElement): void {
    field.removeAttribute("data-invalid");
    field.removeAttribute("aria-invalid");
    field.removeAttribute("data-validation-message");

    const element = field as HTMLElement & {
      helpText?: string;
    };

    if ("helpText" in element) {
      element.helpText = "";
    }
  }
}
