import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { WaMultiStepForm } from "../src/index.js";


function createForm(): HTMLFormElement {
  document.body.innerHTML = `
    <form id="property-form">
      <wa-tab-group>
        <wa-tab panel="basics">Basics</wa-tab>
        <wa-tab panel="classification">
          Classification
        </wa-tab>

        <wa-tab-panel name="basics">
          <wa-input name="name"></wa-input>
        </wa-tab-panel>

        <wa-tab-panel name="classification">
          <wa-select name="category"></wa-select>
        </wa-tab-panel>
      </wa-tab-group>

      <wa-button class="wa-multistep-next">
        Continue
      </wa-button>

      <wa-button class="wa-multistep-previous">
        Back
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


const form = createForm();
const wizard = new WaMultiStepForm({
  form,
  steps: [
    {
      id: "basics",
      fields: ["name"],

      validators: [
        {
          name: "name-availability",
          fields: ["name"],
          source: "backend",

          validate: async ({
            value,
            values,
            signal,
          }) => {
            const response = await fetch(
              "/api/properties/check-name/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: value,
                  values,
                }),
                signal,
              }
            );

            const data = await response.json();

            return {
              valid: data.available,
              message:
                data.message ??
                "This name is unavailable.",
              source: "backend",
            };
          },
        },
      ],
    },

    {
      id: "classification",
      fields: ["category"],
    },
  ],
});


function getNameField(
  form: HTMLFormElement
): HTMLElement & { value: string } {
  const field = form.querySelector(
    'wa-input[name="name"]'
  ) as HTMLElement & { value: string };

  field.value = "Existing property";

  return field;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("server-side field validation", () => {
  it("prevents navigation when the server rejects a field", async () => {
    const form = createForm();
    const nameField = getNameField(form);

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            available: false,
            message:
              "A property with this name already exists.",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      );

    const invalidEvents: unknown[] = [];

    const wizard = new WaMultiStepForm({
      form,

      steps: [
        {
          id: "basics",
          fields: ["name"],

          validators: [
            {
              name: "name-availability",
              fields: ["name"],
              source: "backend",

              validate: async ({
                value,
                values,
                signal,
              }) => {
                expect(value).toBe(
                  "Existing property"
                );

                expect(values.name).toBe(
                  "Existing property"
                );

                expect(signal).toBeInstanceOf(
                  AbortSignal
                );

                const response = await fetch(
                  "/api/properties/check-name/",
                  {
                    method: "POST",
                    signal,
                  }
                );

                const data = await response.json();


                return {
                  valid: data.available,
                  message: data.message,
                  source: "backend",
                };
              },
            },
          ],
        },

        {
          id: "classification",
          fields: ["category"],
        },
      ],
    });

    wizard.on("step:invalid", (payload) => {
      invalidEvents.push(payload);
    });

    await wizard.next();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/properties/check-name/",
      expect.objectContaining({
        method: "POST",
        signal: expect.any(AbortSignal),
      })
    );

    expect(wizard.getCurrentStep()).toBe(
      "basics"
    );

    expect(wizard.getErrors()).toEqual([
      expect.objectContaining({
        field: "name",
        message:
          "A property with this name already exists.",
        source: "backend",
      }),
    ]);

    expect(
      (nameField as HTMLElement).getAttribute(
        "aria-invalid"
      )
    ).toBe("true");

    expect(invalidEvents).toHaveLength(1);
  });
  it("navigates when the server accepts a field", async () => {
  const form = createForm();
  getNameField(form);

  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(
        JSON.stringify({
          available: true,
          message: "",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );

  const wizard = new WaMultiStepForm({
    form,

    steps: [
      {
        id: "basics",
        fields: ["name"],

        validators: [
          {
            name: "name-availability",
            fields: ["name"],
            source: "backend",

            validate: async ({ value, signal }) => {
              const response = await fetch(
                "/api/properties/check-name/",
                {
                  method: "POST",
                  body: JSON.stringify({
                    name: value,
                  }),
                  signal,
                }
              );

              const data = await response.json();

              return {
                valid: data.available,
                message: data.message,
                source: "backend",
              };
            },
          },
        ],
      },

      {
        id: "classification",
        fields: ["category"],
      },
    ],
  });

  await wizard.next();

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(wizard.getCurrentStep()).toBe(
    "classification"
  );
  expect(wizard.getErrors()).toEqual([]);
});
it("validates before changing the step", async () => {
  const form = createForm();
  getNameField(form);

  const order: string[] = [];

  vi.spyOn(globalThis, "fetch").mockImplementation(
    async () => {
      order.push("server-validation");

      return new Response(
        JSON.stringify({
          available: true,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  );

  const wizard = new WaMultiStepForm({
    form,

    steps: [
      {
        id: "basics",
        fields: ["name"],

        validators: [
          {
            fields: ["name"],
            validate: async ({ signal }) => {
              await fetch(
                "/api/properties/check-name/",
                { signal }
              );

              return { valid: true };
            },
          },
        ],
      },

      {
        id: "classification",
      },
    ],
  });

  wizard.on("step:change", () => {
    order.push("step-change");
  });

  await wizard.next();

  expect(order).toEqual([
    "server-validation",
    "step-change",
  ]);
});
it("uses the configured error renderer", async () => {
  const form = createForm();
  const field = getNameField(form);

  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        available: false,
        message: "Name already exists.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  );

  const show = vi.fn();
  const clear = vi.fn();

  const wizard = new WaMultiStepForm({
    form,

    errorRenderer: {
      show,
      clear,
    },

    steps: [
      {
        id: "basics",
        fields: ["name"],

        validators: [
          {
            fields: ["name"],
            source: "backend",

            validate: async ({ signal }) => {
              const response = await fetch(
                "/api/check-name/",
                { signal }
              );

              const data = await response.json();

              return {
                valid: data.available,
                message: data.message,
                source: "backend",
              };
            },
          },
        ],
      },
    ],
  });

  await wizard.next();

  expect(show).toHaveBeenCalledWith(
    field,
    expect.objectContaining({
      field: "name",
      message: "Name already exists.",
      source: "backend",
    })
  );

  expect(clear).not.toHaveBeenCalled();
});
it("cancels stale server validation", async () => {
  const form = createForm();
  getNameField(form);

  let resolveFirst:
    | ((response: Response) => void)
    | undefined;

  let resolveSecond:
    | ((response: Response) => void)
    | undefined;

  const firstResponse = new Promise<Response>(
    (resolve) => {
      resolveFirst = resolve;
    }
  );

  const secondResponse = new Promise<Response>(
    (resolve) => {
      resolveSecond = resolve;
    }
  );

  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockReturnValueOnce(firstResponse)
    .mockReturnValueOnce(secondResponse);

  const wizard = new WaMultiStepForm({
    form,

    steps: [
      {
        id: "basics",
        fields: ["name"],

        validators: [
          {
            name: "name-availability",
            fields: ["name"],
            source: "backend",

            validate: async ({ signal }) => {
              const response = await fetch(
                "/api/check-name/",
                { signal }
              );

              const data = await response.json();

              return {
                valid: data.available,
                message: data.message,
                source: "backend",
              };
            },
          },
        ],
      },
    ],
  });

  const firstValidation =
    wizard.validate();

  await Promise.resolve();

  const secondValidation =
    wizard.validate();

  resolveSecond?.(
    new Response(
      JSON.stringify({
        available: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  );

  const secondResult = await secondValidation;

  expect(secondResult.valid).toBe(true);

  resolveFirst?.(
    new Response(
      JSON.stringify({
        available: false,
        message: "Stale response.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  );

  await firstValidation;

  expect(wizard.getErrors()).toEqual([]);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
});