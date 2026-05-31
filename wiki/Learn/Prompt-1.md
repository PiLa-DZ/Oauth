To integrate Google or Facebook signup into your **Workout-Tracker** app's backend modular architecture, you do not want to use complex, old-school redirection wrappers like Passport.js. Since you already have clean, robust services (`login.service.ts`, `generateTokens.ts`), the best industry practice is **Token-Based Social Authentication (IdP Validation)**.

### How It Works (The Mobile/Frontend Friendly Flow)

1. Your frontend (phone/web) handles the official Google or Facebook SDK login popup.
2. The frontend receives a secure identity token (`idToken` from Google, or an `accessToken` from Facebook).
3. The frontend sends that token to your new backend endpoint: `/api/auth/oauth`.
4. Your server securely validates that token with Google/Facebook's API, extracts the verified `email`, and either **signs up** the user if new, or **logs them in** if they already exist, returning your native app's cookies and access tokens.

---

### Step 1: Install official OAuth validation clients

Run this in your terminal to fetch the official Google auth library:

```bash
npm install google-auth-library

```

---

### Step 2: Update Your Request Validation

Since a social login doesn't pass a password, update `validate.middleware.ts` or make a new conditional validation scheme using Zod to handle social payload routes:

```ts
// Add this to your schema validations or extend bodySchema
export const oauthBodySchema = z.object({
  provider: z.enum(["google", "facebook"]),
  token: z.string().min(1, "OAuth token is required"),
});
```

---

### Step 3: Create the Identity Verification Core

Create a new utility service file at `./services/helpers/oauth.verifier.ts` to swap tokens for verified profile emails securely.

```ts
import { OAuth2Client } from "google-auth-library";
import { AppError } from "../../../errors/app.error.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyOAuthToken = async (
  provider: "google" | "facebook",
  token: string,
): Promise<string> => {
  if (provider === "google") {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new AppError("Invalid Google token payload", 400);
      }
      return payload.email;
    } catch (err) {
      throw new AppError("Google token authentication failed", 401);
    }
  }

  if (provider === "facebook") {
    try {
      // Query Facebook's Graph API debug token endpoint directly using fetch
      const fbResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,email&access_token=${token}`,
      );
      const fbData = (await fbResponse.json()) as {
        email?: string;
        error?: any;
      };

      if (fbData.error || !fbData.email) {
        throw new AppError("Facebook token authentication failed", 401);
      }
      return fbData.email;
    } catch (err) {
      throw new AppError("Facebook Graph validation offline", 500);
    }
  }

  throw new AppError("Unsupported OAuth Provider", 400);
};
```

---

### Step 4: Write the Social Login/Signup Service

Create `./services/oauth.service.ts`. This mimics your standard `loginService` but uses **Upsert (Find or Create)** logic. If the email doesn't exist, it creates a passwordless account; otherwise, it logs them straight in.

```ts
import db from "../../../lib/db.js";
import { generateTokens } from "./helpers/generateTokens.js";
import { verifyOAuthToken } from "./helpers/oauth.verifier.js";

export const oauthService = async (
  provider: "google" | "facebook",
  token: string,
) => {
  // 1. Verify token externally and pull back verified email matching the user
  const email = await verifyOAuthToken(provider, token);

  // 2. Find or create user account (Upsert)
  let user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (!user) {
    // New User Signup via Social Profile
    user = await db.user.create({
      data: {
        email,
        hashPassword: "", // Empty password strings indicate social identity federation accounts
      },
      select: { id: true, email: true },
    });
  }

  // 3. Issue native platform session context matching login.service.ts
  const { accessToken, refreshToken, hashRefreshToken, expiresAt } =
    await generateTokens(user.id);

  // 4. Track session database state records
  await db.refreshToken.create({
    data: {
      userId: user.id,
      hashRefreshToken,
      expiresAt,
    },
  });

  return { user, accessToken, refreshToken };
};
```

---

### Step 5: Wire the Controller & Route

Add your controller inside `auth.controller.ts` to seamlessly write HTTP-only cookies exactly like your standard credential logins:

```ts
import { oauthService } from "./services/oauth.service.js";

export const oauthController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { provider, token } = req.body; // Validated via Zod

    const { user, accessToken, refreshToken } = await oauthService(
      provider,
      token,
    );

    // Set HTTP-Only Cookie matching your strict security settings
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: `Success authentication via ${provider}`,
      data: {
        user: { id: user.id, email: user.email },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};
```

Expose it directly inside your routing tree (`auth.route.ts`):

```ts
// Import your new controller and scheme validation
route.post("/oauth", oauthController);
```

---

### Step 6: Maintain Automated Test Coverage (Vitest)

Create a clean execution test inside your test matrix layout at `./tests/auth.oauth.test.ts` to ensure validations work correctly:

```ts
import { describe, it, expect, vi } from "vitest";
import * as verifier from "./services/helpers/oauth.verifier.js";
import supertest from "supertest";
import app from "../../app.js"; // Adjust to your express entry location

describe("API '/auth/oauth'", () => {
  it("Should log in or sign up user successfully with a valid Google token", async () => {
    // Mock the external network verification call so testing doesn't need hitting real Google APIs
    vi.spyOn(verifier, "verifyOAuthToken").mockResolvedValue(
      "oauth-tester@workout.com",
    );

    const res = await supertest(app)
      .post("/auth/oauth")
      .send({ provider: "google", token: "valid-mock-token-xyz" })
      .expect(200);

    expect(res.body.data.user).toHaveProperty("id");
    expect(res.body.data.user.email).toBe("oauth-tester@workout.com");
    expect(res.body.data).toHaveProperty("accessToken");
  });
});
```

### Why this approach rules for your project

1. **Database Consistency:** It links up seamlessly with your existing prisma/relational tokens structure.
2. **Security:** By handling token verification inside `oauth.verifier.ts`, hackers can't spoof accounts simply by guessing email parameters.
3. **Frontend Flexibility:** Your mobile phone app stays fast because it only needs to grab a token from the native Google/Facebook buttons and post it directly to your backend!
