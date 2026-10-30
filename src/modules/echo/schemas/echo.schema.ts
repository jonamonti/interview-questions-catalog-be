import { z } from "zod";

export const echoRequestSchema = z
  .object({
    message: z.string().min(1).max(200),
    times: z.coerce.number().int().min(1).max(5).default(1),
  })
  .strict()
  .meta({ id: "EchoRequest", description: "Body of POST /api/echo" });

export type EchoRequest = z.infer<typeof echoRequestSchema>;
