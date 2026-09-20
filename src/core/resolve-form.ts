import type { FormReference } from "./types.js";
import { WaMultiStepFormError } from "./errors.js";

export function resolveForm(reference: FormReference): HTMLFormElement {
  if (reference instanceof HTMLFormElement) {
    return reference;
  }

  const form = document.querySelector(reference);

  if (!(form instanceof HTMLFormElement)) {
    throw new WaMultiStepFormError(
      `No form was found for selector "${reference}".`,
    );
  }

  return form;
}
