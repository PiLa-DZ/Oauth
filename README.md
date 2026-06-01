# Setup for Linux

You have to install `MariaDB`

Edit `.env`

```bash
# NOTE: Get your client id from console.cloud.google.com
# NOTE: Setup you Database with 'admin:you_password'
cp .env.example .env

npm i

# NOTE: Delete the "oauth_db" from you database if exists
npx prisma db push
npx prisma generate
```

```bash
npm run dev
```

---

If you want to make the server global in the internet

```bash
ssh -R google-aoth:80:localhost:3000 serveo.net
```

[You web side](https://google-aoth.serveousercontent.com)
