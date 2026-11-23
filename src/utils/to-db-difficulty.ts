import type { ApiDifficulty } from "../constants/difficulty.constants";
import { Difficulty } from "../generated/prisma/enums";

const dbDifficultyByApiValue: Record<ApiDifficulty, Difficulty> = {
  easy: Difficulty.EASY,
  medium: Difficulty.MEDIUM,
  hard: Difficulty.HARD,
};

const toDbDifficulty = (difficulty: ApiDifficulty): Difficulty =>
  dbDifficultyByApiValue[difficulty];

export default toDbDifficulty;
