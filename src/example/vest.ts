import { create, enforce, test } from "vest";
import { vestValidator } from "../adapters/vest";

const suite = create((data) => {
  test("name", "Name is required.", () => {
    enforce(data.name).isNotEmpty();
  });
});

const validator = vestValidator({
  suite,
});