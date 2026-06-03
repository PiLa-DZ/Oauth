# 1. Install Redis via Pacman

First, pull down the official Redis package from the extra repositories:

```bash
sudo pacman -S redis

```

---

## 2. Manage the Background Service with Systemd

```bash
# 🛠️ Start the Redis background service right now
sudo systemctl start redis

# 🔄 Enable it to boot up automatically whenever you turn on your machine
sudo systemctl enable redis

```

---

## 3. Verify that the Server is Alive 🟢

```bash
redis-cli ping
# Output:
PONG

```

---

## 4. TEST

```bash
# Store a test string key
redis-cli set test_session "nabil_secure_payload"

# Retrieve it instantly
redis-cli get test_session

```

## NPM

```bash
npm install redis
```

## Watch

```bash
redis-cli monitor
```
