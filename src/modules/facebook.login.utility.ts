import { AppError } from "../errors/app.error.js";
import z from "zod";

// Create a Zod schema to validate what Facebook returns to us
const facebookProfileSchema = z.object({
  id: z.string(), // This is the guaranteed Facebook User ID
  first_name: z.string(),
  last_name: z.string().optional(),
  email: z.email().optional(), // Optional!
  picture: z
    .object({
      data: z.object({
        url: z.url(),
      }),
    })
    .optional(),
});

export const facebookLoginUtility = async (accessToken: string) => {
  try {
    // 🌐 We query Meta's Graph API directly using the token sent by the frontend
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,first_name,last_name,email,picture.type(large)&access_token=${accessToken}`,
    );

    if (!response.ok) {
      throw new AppError(
        "Failed to authenticate token with Facebook Graph API",
        401,
      );
    }

    const rawData = await response.json();

    // Parse it with Zod to maintain strict structural integrity
    return facebookProfileSchema.parse(rawData);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      "Facebook authentication link communication failure",
      500,
    );
  }
};
