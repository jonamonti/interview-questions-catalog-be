import { Difficulty } from "../generated/prisma/enums";
import toApiDifficulty from "./to-api-difficulty";

describe("toApiDifficulty", () => {
  it.each([
    [Difficulty.EASY, "easy"],
    [Difficulty.MEDIUM, "medium"],
    [Difficulty.HARD, "hard"],
  ] as const)(
    "turns the database value %j into the API value %j",
    (db, api) => {
      // ACT & ASSERT
      expect(toApiDifficulty(db)).toBe(api);
    },
  );

  it("covers every database value", () => {
    // ACT & ASSERT
    expect(Object.values(Difficulty).map(toApiDifficulty).sort()).toEqual([
      "easy",
      "hard",
      "medium",
    ]);
  });
});
