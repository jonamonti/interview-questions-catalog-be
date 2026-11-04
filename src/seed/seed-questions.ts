import type { CreateQuestionRequest } from "../modules/question/schemas/create-question.schema";

const PAGE_LIMIT = 100;

type SeedOptions = {
  baseUrl: string;
  apiKey: string;
  questions: CreateQuestionRequest[];
};

type SeedResult = { created: number; skipped: number };

const fetchExistingTitles = async (baseUrl: string) => {
  const titles = new Set<string>();
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(
      `${baseUrl}/api/questions?page=${page}&limit=${PAGE_LIMIT}`,
    );
    if (!response.ok) {
      throw new Error(`GET /api/questions failed with ${response.status}`);
    }
    const { data } = (await response.json()) as {
      data: {
        pagination: { totalPages: number };
        list: { title: string }[];
      };
    };
    data.list.forEach(({ title }) => titles.add(title));
    totalPages = data.pagination.totalPages;
    page += 1;
  }

  return titles;
};

const seedQuestions = async ({
  baseUrl,
  apiKey,
  questions,
}: SeedOptions): Promise<SeedResult> => {
  const existingTitles = await fetchExistingTitles(baseUrl);
  const result: SeedResult = { created: 0, skipped: 0 };

  for (const question of questions) {
    if (existingTitles.has(question.title)) {
      result.skipped += 1;
      continue;
    }

    const response = await fetch(`${baseUrl}/api/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify(question),
    });
    if (!response.ok) {
      throw new Error(
        `POST /api/questions failed with ${response.status} for "${question.title}"`,
      );
    }
    result.created += 1;
  }

  return result;
};

export default seedQuestions;
