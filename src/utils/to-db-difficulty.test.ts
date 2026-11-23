import { apiDifficulty } from "../constants/difficulty.constants";
import { Difficulty } from "../generated/prisma/enums";
import toApiDifficulty from "./to-api-difficulty";
import toDbDifficulty from "./to-db-difficulty";

describe("toDbDifficulty", () => {
  it.each([
    ["easy", Difficulty.EASY],
    ["medium", Difficulty.MEDIUM],
    ["hard", Difficulty.HARD],
  ] as const)(
    "turns the API value %j into the database value %j",
    (api, db) => {
      // ACT & ASSERT
      expect(toDbDifficulty(api)).toBe(db);
    },
  );

  it.each(apiDifficulty)("round-trips %j through the database value", (api) => {
    // ACT & ASSERT
    expect(toApiDifficulty(toDbDifficulty(api))).toBe(api);
  });
});
