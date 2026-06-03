- [x] Authentication
  - [x] JWT _Stateless_
  - [x] OAuth
  - [x] Basic authentication
  - [x] Token authentication
  - [x] OpenID
  - [x] Cookie-Based Authentication _Stateful_
  - [ ] SAML `Skip`

---

- [x] Cookie-Based Authentication _Stateful_
  - [x] Use httpOnly
  - [x] Session ID `Save on browser-cookie`
  - [x] Hash Session ID `Save on Database/Cache`
  - [x] Relation Ship to user id `Save user id on Database/Cache`
  - [x] SESSION HIJACKING user-agent `Save device info on Database/Cache`
  - [x] Session expiresAt `Session life`
  - [x] Store in database `MongoDB/NoSQL`
  - [x] Store in cache (Cache-Aside Architecture) `Redis`
  - [x] Need (Sliding Session) `Like Rifresh Token`
  - [x] Implement Signed Cookies `More security`

---

- [ ] JWT Authentication _Stateless_
  - [ ] Use Two-Token Architecture `Access Token (Short life) + Refresh Token (Long life)`
  - [ ] Access Token Payload `Store non-sensitive details inside the token (userId, role)`
  - [ ] Cryptographic Signature `Sign with a private server key (HMAC-SHA256) to make it un-tamperable`
  - [ ] Client Storage Strategy `Store Access Token in memory (JS state) / Refresh Token in an httpOnly cookie`
  - [ ] Absolute Expiration enforcement `Access Token expires strictly in 15 minutes`
  - [ ] Token Rotation (RTR) `Issue a brand-new Refresh Token every time the Access Token is renewed`
  - [ ] Refresh Token Reuse Detection `Detect if an old Refresh Token is re-used, implying theft, and instantly revoke the user's entire family of tokens`
  - [ ] Clock Skew Tolerance `Add a 1-2 minute buffer during validation to handle servers with slightly out-of-sync system times`

---

- [ ] Authentication Strategy & Identity Provisioning
  - [ ] Strategy A: Native Credentials (Email + Password)
    - [ ] Secure Transportation `Enforce HTTPS to prevent raw password exposure over networks`
    - [ ] Un-compromisable Hashing `Hash passwords before they touch disk using bcrypt or Argon2id`
    - [ ] Salt Injection `Automatically add random cryptographic salt to prevent Rainbow Table attacks`
    - [ ] Contract Verification `Validate formatting with strict Zod schemas (e.g., strong password criteria, valid email formats)`
  - [ ] Strategy B: Third-Party OAuth (Google, Facebook, GitHub, etc.)
    - [ ] Delegated Trust `Let trusted giants handle the physical user passwords, multi-factor codes, and security alerts`
    - [ ] Client SDK Integration `Launch provider login menus natively on the front-end to safely capture the client credential`
    - [ ] Back-end Graph API Validation `Forward the identity token to Meta or Google servers over a secure back-channel to verify it is authentic`
    - [ ] Lazy User Provisioning `Perform an "Upsert" step: Check if the external account ID exists in your DB; if not, instantly create a new User row using their social profile data`

---
