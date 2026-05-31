import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../src/app.js";

describe("OAuth Engine Learning Testing Suites", () => {
  it("🛡️ Should block profile reading requests if authorization header is dropped completely", async () => {
    const res = await supertest(app).get("/api/users/profile").expect(401);

    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("Invalid or expired");
  });

  it("🛡️ Should block profile reading requests if an invalid token is passed", async () => {
    const res = await supertest(app)
      .get("/api/users/profile")
      .set("Authorization", "Bearer invalid-garbage-token-signature")
      .expect(401);

    expect(res.body.message).toContain("Invalid or expired");
  });
});
