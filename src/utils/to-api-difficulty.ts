import type { ApiDifficulty } from "../constants/difficulty.constants";
import { Difficulty } from "../generated/prisma/enums";

const apiValueByDbDifficulty: Record<Difficulty, ApiDifficulty> = {
  [Difficulty.EASY]: "easy",
  [Difficulty.MEDIUM]: "medium",
  [Difficulty.HARD]: "hard",
};

const toApiDifficulty = (difficulty: Difficulty): ApiDifficulty =>
  apiValueByDbDifficulty[difficulty];

export default toApiDifficulty;
