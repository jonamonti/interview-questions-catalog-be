export const apiDifficulty = ["easy", "medium", "hard"] as const;

export type ApiDifficulty = (typeof apiDifficulty)[number];
