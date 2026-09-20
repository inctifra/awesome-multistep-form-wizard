export class ValueReader {
  read(field: HTMLElement): unknown {
    const element = field as HTMLElement & {
      value?: unknown;
      checked?: boolean;
    };

    if (this.isCheckbox(field)) {
      return element.checked === true;
    }

    if ("value" in element) {
      return element.value ?? "";
    }

    return field.getAttribute("value") ?? "";
  }

  readMany(fields: HTMLElement[]): Record<string, unknown> {
    const values: Record<string, unknown> = {};

    for (const field of fields) {
      const name = field.getAttribute("name");

      if (!name) {
        continue;
      }

      values[name] = this.read(field);
    }

    return values;
  }

  readForm(form: HTMLFormElement): Record<string, unknown> {
    const fields = Array.from(form.querySelectorAll<HTMLElement>("[name]"));

    return this.readMany(fields);
  }

  private isCheckbox(field: HTMLElement): boolean {
    return (
      field.matches("wa-checkbox") || field.getAttribute("type") === "checkbox"
    );
  }
}
