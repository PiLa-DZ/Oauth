import { createClient } from "redis";

// Initialize the native open-source driver client
const cache = createClient({
  url: "redis://localhost:6379",
});

cache.on("error", (err) => {
  console.error("REDIS/VALKEY CORE ENGINE EXCEPTION:", err);
});

// Immediately self-invoke the async event connection block
await cache.connect().catch((err) => {
  console.error("CRITICAL CACHE INTERFACE LINK FAILURE:", err);
});

export default cache;
