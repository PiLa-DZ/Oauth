Now that your database schema is updated, your authentication middleware locks down the routes securely, and your Facebook OAuth integration successfully handles tokens, you have a solid backend foundation.

Since your goal with this project is to fully **learn and master OAuth**, the next step is bridging the gap between your backend API and a real-world client workflow.

Here are the best next milestones to tackle to complete your understanding of OAuth:

---

### 1. Build a Simple Frontend Testing Page

To test your Facebook login without needing a fully built mobile or web app, create a basic `index.html` file in a `public/` directory on your server. You can use Facebook's official Javascript SDK to generate a login button that gives you a test token.

The flow works like this:

Here is how simple the frontend client script is to test your API:

```html
<div id="fb-root"></div>
<script
  async
  defer
  crossorigin="anonymous"
  src="https://connect.facebook.net/en_US/sdk.js"
></script>

<button onclick="launchFBLogin()">Login with Facebook</button>

<script>
  window.fbAsyncInit = function () {
    FB.init({
      appId: "YOUR_FACEBOOK_APP_ID", // Get this from developers.facebook.com
      cookie: true,
      xfbml: true,
      version: "v18.0",
    });
  };

  function launchFBLogin() {
    FB.login(
      function (response) {
        if (response.authResponse) {
          const token = response.authResponse.accessToken;

          // 🚀 Post the token directly to your Express backend!
          fetch("/api/auth/facebook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: token }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log(
                "Logged in! Your JWT Access Token is:",
                data.accessToken,
              );
              // Save data.accessToken in memory or localStorage to read your profile next!
            });
        }
      },
      { scope: "email" },
    ); // Request permission to see their email address
  }
</script>
```

---

### 2. Implement "Token Refreshing" for Social Accounts

Right now, your short-lived access token expires in 15 minutes. If a user is actively browsing their profile after 15 minutes, their requests will start failing with a `401 Unauthorized` error.

Your next backend coding task should be setting up a `/api/auth/refresh` endpoint that:

1. Reads the HTTP-only `refreshToken` cookie you saved during the Facebook login.
2. Checks your database's `RefreshToken` table to make sure it exists and hasn't expired.
3. Rotates it by deleting the old token, generating a fresh pair, and sending a new access token back to the user.

This ensures that once a user signs in with Facebook, they stay logged into your application smoothly.

---

### 3. Handle Account Linking (Advanced)

What happens if a user signs up using standard email/password credentials (`nabil@example.com`), logs out, and later clicks "Login with Facebook" using an account tied to that exact same email address?

Right now, your `upsert` strategy in `facebookLoginController` will find the user, but it won't check if they already have a password.

- **Learning Task:** Update your logic to handle account conflicts safely. Decide if you want to automatically link the Facebook profile to their existing account, or block it and tell them to login with their password first to prevent account hijacking!

---

### 4. Mock the Facebook API inside your Vitest Suites

In your previous steps, you used a simple mock inside your test. To make your tests bulletproof and professional, look into using tools like **MSW (Mock Service Worker)** or extending your `vitest` suite to completely simulate Facebook's Graph API server responses. This lets you test what happens when a token is completely expired, invalid, or when Facebook's servers are down, ensuring your `globalError` middleware intercepts the failures cleanly.

Which of these milestones do you want to tackle first to level up your OAuth project?
