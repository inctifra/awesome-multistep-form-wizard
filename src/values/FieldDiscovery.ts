import type { FieldName, WizardStep } from "../core/types.js";

export class FieldDiscovery {
  constructor(private readonly form: HTMLFormElement) {}

  findField(name: FieldName): HTMLElement | null {
    const fields = this.form.querySelectorAll<HTMLElement>(
      `[name="${this.escapeAttribute(name)}"]`,
    );

    return fields.item(0) || null;
  }

  findStepFields(step: WizardStep): HTMLElement[] {
    const fields = step.fields ?? [];

    return fields.flatMap((name) => {
      const field = this.findField(name);

      return field ? [field] : [];
    });
  }

  findMissingFields(step: WizardStep): FieldName[] {
    const fields = step.fields ?? [];

    return fields.filter((name) => !this.findField(name));
  }

  private escapeAttribute(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }
}
