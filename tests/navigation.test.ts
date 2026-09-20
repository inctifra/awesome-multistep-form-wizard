import { describe, expect, it } from "vitest";
import { WaMultiStepForm } from "../src/index.js";
import { ValueReader } from "../src/values/ValueReader.js";

function createForm(): HTMLFormElement {
  document.body.innerHTML = `
    <form id="property-form">
      <wa-tab-group>
        <wa-tab panel="basics">Basics</wa-tab>
        <wa-tab panel="classification">Classification</wa-tab>
        <wa-tab panel="location">Location</wa-tab>

        <wa-tab-panel name="basics">
          <wa-input name="name"></wa-input>
          <wa-input name="reference"></wa-input>
        </wa-tab-panel>

        <wa-tab-panel name="classification">
          <wa-select name="category"></wa-select>
        </wa-tab-panel>

        <wa-tab-panel name="location">
          <wa-input name="address"></wa-input>
        </wa-tab-panel>
      </wa-tab-group>

      <wa-button class="wa-multistep-previous">
        Back
      </wa-button>

      <wa-button class="wa-multistep-next">
        Continue
      </wa-button>
    </form>
  `;

  const form = document.querySelector(
    "#property-form"
  );

  if (!(form instanceof HTMLFormElement)) {
    throw new Error("Test form was not found.");
  }

  return form;
}

describe("WaMultiStepForm", () => {
  it("initializes on the first step", () => {
    const form = createForm();

    const wizard = new WaMultiStepForm({
      form,
      steps: [
        {
          id: "basics",
          fields: ["name"],
        },
        {
          id: "classification",
          fields: ["category"],
        },
      ],
    });

    expect(wizard.getCurrentStep()).toBe("basics");
  });

it("moves to the next step", async () => {
  const form = createForm();

  const wizard = new WaMultiStepForm({
    form,
    steps: [
      {
        id: "basics",
      },
      {
        id: "classification",
      },
    ],
  });

  await wizard.next();

  expect(wizard.getCurrentStep()).toBe(
    "classification"
  );
});

  it("moves back to the previous step", async () => {
    const form = createForm();

    const wizard = new WaMultiStepForm({
      form,
      steps: [
        {
          id: "basics",
        },
        {
          id: "classification",
        },
      ],
    });

    await wizard.next();
    await wizard.previous();

    expect(wizard.getCurrentStep()).toBe("basics");
  });

  it("rejects duplicate step IDs", () => {
    const form = createForm();

    expect(() => {
      new WaMultiStepForm({
        form,
        steps: [{ id: "basics" }, { id: "basics" }],
      });
    }).toThrow("Step IDs must be unique");
  });
  it("enables only the active tab", () => {
  const form = createForm();

  const wizard = new WaMultiStepForm({
    form,
    steps: [
      { id: "basics" },
      { id: "classification" },
      { id: "location" },
    ],
  });

  const basicsTab = form.querySelector(
    'wa-tab[panel="basics"]'
  ) as HTMLElement & { disabled: boolean };

  const classificationTab = form.querySelector(
    'wa-tab[panel="classification"]'
  ) as HTMLElement & { disabled: boolean };

  const locationTab = form.querySelector(
    'wa-tab[panel="location"]'
  ) as HTMLElement & { disabled: boolean };

  expect(basicsTab.disabled).toBe(false);
  expect(classificationTab.disabled).toBe(true);
  expect(locationTab.disabled).toBe(true);
});
it("changes which tab is enabled after navigation", async () => {
  const form = createForm();

  const wizard = new WaMultiStepForm({
    form,
    steps: [
      { id: "basics" },
      { id: "classification" },
      { id: "location" },
    ],
  });

  await wizard.next();

  const basicsTab = form.querySelector(
    'wa-tab[panel="basics"]'
  ) as HTMLElement & { disabled: boolean };

  const classificationTab = form.querySelector(
    'wa-tab[panel="classification"]'
  ) as HTMLElement & { disabled: boolean };

  expect(basicsTab.disabled).toBe(true);
  expect(classificationTab.disabled).toBe(false);
});
});


describe("ValueReader", () => {
  it("reads Web Awesome control values", () => {
    document.body.innerHTML = `
      <form>
        <wa-input name="name"></wa-input>
        <wa-checkbox name="active"></wa-checkbox>
      </form>
    `;

    const input = document.querySelector(
      "wa-input"
    ) as HTMLElement & { value: string };

    const checkbox = document.querySelector(
      "wa-checkbox"
    ) as HTMLElement & { checked: boolean };

    input.value = "Example property";
    checkbox.checked = true;

    const form = document.querySelector("form")!;

    expect(new ValueReader().readForm(form)).toEqual({
      name: "Example property",
      active: true,
    });
  });
});