import { z } from "zod";
import { WaMultiStepForm } from "../core/WaMultiStepForm";
import { zodValidator } from "../adapters/zod";


const basicsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Property name is required."),

  reference: z
    .string()
    .trim()
    .min(1, "Reference is required."),
});

const wizard =
  new WaMultiStepForm({
    form: "#property-form",

    steps: [
      {
        id: "basics",
        fields: ["name", "reference"],

        validators: [
          {
            name: "basics-schema",
            fields: ["name", "reference"],
            validate: zodValidator({
              schema: basicsSchema,
            }),
          },
        ],
      },
    ],
  });