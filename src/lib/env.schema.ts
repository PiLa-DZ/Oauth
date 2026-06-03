import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3456),
  DATABASE_URL: z.url(),
  COOKIE_SECRET: z.string().min(32), // 👈 Added Validation Line
  FACEBOOK_APP_ID: z.string().min(1), // 👈 Swapped
  FACEBOOK_APP_SECRET: z.string().min(1), // 👈 Swapped
  NODE_ENV: z.enum(["development", "test", "production"]),
});

const parse = envSchema.safeParse(process.env);

if (!parse.success) {
  console.error("Missing .env", parse.error.issues);
  process.exit(1);
}

export default parse.data;
