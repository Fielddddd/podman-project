import express, { type Express, type Request, type Response } from "express";
import { createClient } from "redis";

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
  },
});
redis.on("error", (err) => console.error("Redis error:", err.message));
await redis.connect();

const app: Express = express();

app.get("/", async (req: Request, res: Response) => {
  const hits = await redis.incr("hits");
  res.send(`Hello World! เปิดมาแล้ว ${hits} ครั้ง`);
});

app.get("/health", async (_req: Request, res: Response) => {
  try {
    await redis.ping();
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "redis unavailable" });
  }
});

const server = app.listen(9999);

const shutdown = async () => {
  server.close();
  await redis.quit();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
