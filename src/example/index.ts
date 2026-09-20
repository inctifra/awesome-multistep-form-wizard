import { WaMultiStepForm } from "../core/WaMultiStepForm";

const wizard =
  new WaMultiStepForm<{ name: string; reference: string }>({
    form: "#property-form",

    steps: [
      {
        id: "basics",
        fields: ["name", "reference"],

        validators: [
          {
            name: "required-name",
            fields: ["name"],
            validate: ({ value }) => {
              if (
                typeof value !== "string" ||
                value.trim() === ""
              ) {
                return {
                  valid: false,
                  message:
                    "Property name is required.",
                  source: "custom",
                };
              }

              return {
                valid: true,
              };
            },
          },
        ],
      },
    ],
  });