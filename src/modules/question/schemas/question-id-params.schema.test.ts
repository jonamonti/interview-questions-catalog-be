import { questionIdParamsSchema } from "./question-id-params.schema";

describe("questionIdParamsSchema", () => {
  it("coerces a numeric string to a number", () => {
    // ACT & ASSERT
    expect(questionIdParamsSchema.parse({ id: "42" })).toEqual({ id: 42 });
  });

  it.each(["abc", "0", "-1", "1.5", ""])("rejects the id %j", (id) => {
    // ACT & ASSERT
    expect(questionIdParamsSchema.safeParse({ id }).success).toBe(false);
  });

  it("rejects unknown keys", () => {
    // ACT & ASSERT
    expect(questionIdParamsSchema.safeParse({ id: "1", foo: 1 }).success).toBe(
      false,
    );
  });
});
