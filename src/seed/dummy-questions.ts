import type { CreateQuestionRequest } from "../modules/question/schemas/create-question.schema";

// Placeholder content for frontend development. Titles start with [DUMMY] so
// they can be told apart from real questions (and removed by that prefix).
export const DUMMY_PREFIX = "[DUMMY] ";

export const dummyQuestions: CreateQuestionRequest[] = [
  {
    title: `${DUMMY_PREFIX}What is a closure?`,
    answer:
      "Placeholder answer. A closure is a function that keeps access to the scope it was created in.\n\n```js\nconst counter = () => {\n  let count = 0;\n  return () => ++count;\n};\n\nconst next = counter();\nnext(); // 1\nnext(); // 2\n```",
    difficulty: "MEDIUM",
    tags: ["javascript", "closures"],
  },
  {
    title: `${DUMMY_PREFIX}What is the difference between var, let and const?`,
    answer:
      "Placeholder answer. Things to cover:\n\n- scope: function vs block\n- hoisting and the temporal dead zone\n- reassignment with `let` vs `const`",
    difficulty: "EASY",
    tags: ["javascript"],
  },
  {
    title: `${DUMMY_PREFIX}How does the Node.js event loop work?`,
    answer:
      "Placeholder answer. Outline of the phases:\n\n1. timers\n2. pending callbacks\n3. poll\n4. check (`setImmediate`)\n5. close callbacks\n\nMicrotasks (promises) run between each step.",
    difficulty: "HARD",
    tags: ["node", "javascript", "event-loop"],
  },
  {
    title: `${DUMMY_PREFIX}What is middleware in Express?`,
    answer:
      "Placeholder answer. A function that receives `req`, `res` and `next`, and can end the request or pass it on.\n\n```ts\nconst logger = (req, res, next) => {\n  console.log(req.method, req.url);\n  next();\n};\n```",
    difficulty: "EASY",
    tags: ["node", "express"],
  },
  {
    title: `${DUMMY_PREFIX}When would you use useEffect, and what are its pitfalls?`,
    answer:
      "Placeholder answer. Use it to synchronise a component with something outside React.\n\nPitfalls: a missing dependency array, stale closures, and effects that should be plain event handlers.",
    difficulty: "MEDIUM",
    tags: ["react", "hooks", "javascript"],
  },
  {
    title: `${DUMMY_PREFIX}Explain the difference between an INNER JOIN and a LEFT JOIN`,
    answer:
      "Placeholder answer.\n\n| Join | Keeps |\n| --- | --- |\n| `INNER JOIN` | only rows that match on both sides |\n| `LEFT JOIN` | every row on the left, matched or not |",
    difficulty: "EASY",
    tags: ["sql"],
  },
  {
    title: `${DUMMY_PREFIX}How would you design a URL shortener that has to handle millions of redirects per day, stay available during a regional outage, and keep the links working for years?`,
    answer:
      "Placeholder answer. This is a deliberately long title to test how the interface handles wrapping.\n\n## Requirements\n\n- redirect latency\n- availability\n- link expiry\n\n## Building blocks\n\n- ID generation\n- storage\n- caching\n- rate limiting\n\n## Trade-offs\n\nPlaceholder text that describes the trade-offs in more detail, so the answer is long enough to scroll. ".repeat(
        8,
      ),
    difficulty: "HARD",
    tags: ["system-design", "caching", "databases"],
  },
  {
    title: `${DUMMY_PREFIX}What are generics in TypeScript?`,
    answer:
      'Placeholder answer. Generics let a function or type work with many types while keeping type safety.\n\n```ts\nconst first = <T>(items: T[]): T | undefined => items[0];\n\nfirst([1, 2, 3]); // number | undefined\nfirst(["a", "b"]); // string | undefined\n```',
    difficulty: "MEDIUM",
    tags: ["typescript"],
  },
];
