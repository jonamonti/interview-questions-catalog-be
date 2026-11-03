import toSlug from "./to-slug";

describe("toSlug", () => {
  it.each([
    ["JavaScript", "javascript"],
    ["system design", "system-design"],
    ["C++", "c-plus-plus"],
    ["C#", "c-sharp"],
    ["  node.js  ", "node-js"],
    ["a  --  b", "a-b"],
    ["!!!", ""],
    ["", ""],
  ])("turns %j into %j", (name, expected) => {
    // ACT & ASSERT
    expect(toSlug(name)).toBe(expected);
  });
});
