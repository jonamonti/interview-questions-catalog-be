import { API_KEY, NODE_ENV, PORT } from "../config";
import { dummyQuestions } from "./dummy-questions";
import seedQuestions from "./seed-questions";

const run = async () => {
  if (NODE_ENV === "production") {
    throw new Error("Refusing to seed dummy questions in production");
  }

  const baseUrl = `http://localhost:${PORT}`;
  try {
    const { created, skipped } = await seedQuestions({
      baseUrl,
      apiKey: API_KEY,
      questions: dummyQuestions,
    });
    console.log(`Seeded ${baseUrl}: created ${created}, skipped ${skipped}`);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Could not reach ${baseUrl}. Is the dev server running? (npm run db:up && npm run dev)`,
        { cause: error },
      );
    }
    throw error;
  }
};

run().catch((error: Error) => {
  console.error(error.message);
  process.exit(1);
});
