import { cn } from "../lib/utils";

describe("cn utility function", () => {
  test("combines class names correctly", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  });

  test("filters out falsy values", () => {
    expect(cn("bg-red-500", null, undefined, false, "text-white")).toBe("bg-red-500 text-white");
  });

  test("handles tailwind class merging correctly", () => {
    expect(cn("p-4 p-2")).toBe("p-2");
  });
});
