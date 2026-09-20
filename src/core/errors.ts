export class WaMultiStepFormError extends Error {
  constructor(message: string) {
    super(`WaMultiStepForm: ${message}`);
    this.name = "WaMultiStepFormError";
  }
}
