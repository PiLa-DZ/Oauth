- secure public URL
- install `ngrok` (available via the AUR) or use `localtunnel` via npm:

```bash
npm install -g localtunnel

```

Let's clear this up completely, bro, because you absolutely **do not** have to pay Facebook a single penny, and you **can** share your local server with your friends for free!

Let's break down how this works in reality so you don't get discouraged.

---

## 1. Facebook Login is 100% Free

Facebook does not charge developers to use their login system. Whether you have 2 friends logging in or 2 million users, **it is completely free.**

---

## 2. You CAN Share Your Local Server with Your Friends (For Free)

You do not need to buy a real cloud server or a domain name right now just to test this with your friends. Since you are running Arch Linux, you can expose your local server to the internet using a free tunneling tool like **ngrok** or **LocalTunnel**.

These tools give you a temporary, secure public URL (like `[https://nabil-auth-test.ngrok-free.app](https://nabil-auth-test.ngrok-free.app)`) that points directly to your local computer's port (like `3000` or `3456`).

If you give that URL to your friends on their real phones, they can access your app running on your laptop!

---

## 3. The "Catch" with Facebook Testing (Development Mode)

When you create a Facebook Developer app, it starts in **Development Mode**.

In Development Mode, Facebook protects real users by blocking random people from logging into your unverified app. However, Facebook gives you a free way to let your friends test it:

- Inside your Facebook App Dashboard, there is a section called **Roles** $\rightarrow$ **Testers**.
- You just type in your friends' Facebook usernames or IDs to add them as Testers.
- Once they click accept, **they can use their real Facebook accounts to log into your local server** through your public ngrok link!

---

## How to Set It Up Right Now for Free

Here is the exact blueprint to test your OAuth project with your friends tonight:

### Step 1: Install a Tunneling Tool on Arch

Open your terminal and install `ngrok` (available via the AUR) or use `localtunnel` via npm:

```bash
npm install -g localtunnel

```

### Step 2: Fire Up the Tunnel

Start your local Node.js server (`npm run dev` on port `3456`), then open a second terminal split and run:

```bash
lt --port 3456

```

This will print a public URL like: `[https://heavy-cats-jump.loca.lt](https://heavy-cats-jump.loca.lt)`. This URL is now live on the internet!

### Step 3: Configure Facebook Developers Console

1. Go to your Facebook App dashboard.
2. In the **Facebook Login > Settings**, find **Valid OAuth Redirect URIs**.
3. Paste your localtunnel URL there: `[https://heavy-cats-jump.loca.lt/api/auth/facebook](https://heavy-cats-jump.loca.lt/api/auth/facebook)`.

### Step 4: Add Your Friends as Testers

1. Go to **App Roles > Testers** in the Facebook dashboard.
2. Add your friends' Facebook accounts.
3. Send them your localtunnel link.

They will click "Login with Facebook", their real phones will communicate securely with Facebook's live servers, Facebook will send the token back to your local machine, and Prisma will save their profile in your database.

You are doing great, bro. OAuth has a lot of moving parts and configuration puzzles, but you don't need money to learn it—just the right setup! Do you want to try setting up the local tunnel first?
