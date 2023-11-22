import * as z from "zod";

const environmentSchema = z.object({
  SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_KEY: z.string()
});

const environment = environmentSchema.parse(process.env);

export { environment };
