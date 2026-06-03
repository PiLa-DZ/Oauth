---

> [!NOTE]
> If you deploy your project exactly as it is written right now
> to a live VPS (like DigitalOcean, Hetzner, or AWS),
> it will fail until you configure HTTPS.

Here is what will happen on a production domain over plain http://:

1. Facebook SDK Blockade:
   As seen in your console screenshots,
   Meta’s security protocols strictly forbid running FB.login
   over unencrypted HTTP channels on real domains.
   The Facebook login window will immediately crash or refuse to open.

2. Cookie Drops:
   Modern browsers aggressively enforce security attributes.
   If your server is running on a production URL without an SSL certificate,
   secure cookie transmissions fail.

How to make it work perfectly on a real server:
You don't need to change any of your Node.js or Express code!
Instead, you set up a Reverse Proxy on your server.

You install a web server like Caddy or Nginx directly onto your production server.
Caddy will automatically talk to Let's Encrypt,
provision a free SSL certificate for your domain,
encrypt all incoming traffic over <https://yourdomain.com>,
and securely pass the requests down locally
to your Express app running on localhost:3456.

Once that secure tunnel is set up,
your stateful cookies and Facebook OAuth flows will
spin up instantly and run flawlessly.

---

OAuth (Authorization/Permissions)
OpenID (Authentication/Identity)

- [x] Authentication `100% Done`
  - [x] JWT `100% Done`
  - [x] OAuth `100% Done`
  - [x] Basic authentication `100% Done (Conceptual Mastery)`
  - [x] Token authentication `100% Done`
  - [x] Cookie-Based Authentication `100% Done (Stateless Cookie Implementation)`
  - [x] OpenID `100% Done (Covered via Google OIDC idToken Integration)`
  - [ ] SAML `Skip`

---

## The 5 Ways to Store Data in a Browser

| Storage Type                | Accessible by JS?      | Persistent?                     | Best Used For                                                  |
| --------------------------- | ---------------------- | ------------------------------- | -------------------------------------------------------------- |
| **1. RAM (Memory / State)** | Yes                    | No (Wiped on page refresh)      | Temporary variables, UI state, short-lived Access Tokens.      |
| **2. LocalStorage**         | Yes                    | Yes (Survives browser restart)  | UI theme preferences (dark/light mode), cached layout data.    |
| **3. Cookies**              | **No** (If `httpOnly`) | Yes (Configurable via `maxAge`) | **Refresh Tokens**, Session IDs, security keys.                |
| **4. SessionStorage**       | Yes                    | No (Wiped when tab closes)      | Temporary multi-step form data, checkout progress.             |
| **5. IndexedDB**            | Yes                    | Yes (Survives browser restart)  | Large amounts of structured data, offline application support. |

> [!NOTE]
> If `httpOnly` is set to false, then frontend JavaScript can read and change the cookie completely using document.cookie.

---

> [!NOTE]
> If you deploy your project exactly as it is written right now
> to a live VPS (like DigitalOcean, Hetzner, or AWS),
> it will fail until you configure HTTPS.

Here is what will happen on a production domain over plain http://:

1. Facebook SDK Blockade:
   As seen in your console screenshots,
   Meta’s security protocols strictly forbid running FB.login
   over unencrypted HTTP channels on real domains.
   The Facebook login window will immediately crash or refuse to open.

2. Cookie Drops:
   Modern browsers aggressively enforce security attributes.
   If your server is running on a production URL without an SSL certificate,
   secure cookie transmissions fail.

How to make it work perfectly on a real server:
You don't need to change any of your Node.js or Express code!
Instead, you set up a Reverse Proxy on your server.

You install a web server like Caddy or Nginx directly onto your production server.
Caddy will automatically talk to Let's Encrypt,
provision a free SSL certificate for your domain,
encrypt all incoming traffic over <https://yourdomain.com>,
and securely pass the requests down locally
to your Express app running on localhost:3456.

Once that secure tunnel is set up,
your stateful cookies and Facebook OAuth flows will
spin up instantly and run flawlessly.

---

OAuth (Authorization/Permissions)
OpenID (Authentication/Identity)

- [x] Authentication `100% Done`
  - [x] JWT `100% Done`
  - [x] OAuth `100% Done`
  - [x] Basic authentication `100% Done (Conceptual Mastery)`
  - [x] Token authentication `100% Done`
  - [x] Cookie-Based Authentication `100% Done (Stateless Cookie Implementation)`
  - [x] OpenID `100% Done (Covered via Google OIDC idToken Integration)`
  - [ ] SAML `Skip`

---

## The 5 Ways to Store Data in a Browser

| Storage Type                | Accessible by JS?      | Persistent?                     | Best Used For                                                  |
| --------------------------- | ---------------------- | ------------------------------- | -------------------------------------------------------------- |
| **1. RAM (Memory / State)** | Yes                    | No (Wiped on page refresh)      | Temporary variables, UI state, short-lived Access Tokens.      |
| **2. LocalStorage**         | Yes                    | Yes (Survives browser restart)  | UI theme preferences (dark/light mode), cached layout data.    |
| **3. Cookies**              | **No** (If `httpOnly`) | Yes (Configurable via `maxAge`) | **Refresh Tokens**, Session IDs, security keys.                |
| **4. SessionStorage**       | Yes                    | No (Wiped when tab closes)      | Temporary multi-step form data, checkout progress.             |
| **5. IndexedDB**            | Yes                    | Yes (Survives browser restart)  | Large amounts of structured data, offline application support. |

> [!NOTE]
> If `httpOnly` is set to false, then frontend JavaScript can read and change the cookie completely using document.cookie.

---
