import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("❌ Redis Client Error", err));
redisClient.on("connect", () => console.log("✅ Redis Connected"));

// Connect explicitly (Node Redis v4+ requires this)
(async () => {
  await redisClient.connect();
})();

export default redisClient;