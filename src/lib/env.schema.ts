import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3456),
  DATABASE_URL: z.url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

const parse = envSchema.safeParse(process.env);

if (!parse.success) {
  console.error("Missing .env", parse.error.issues);
  process.exit(1);
}

export default parse.data;
