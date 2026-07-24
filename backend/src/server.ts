import app from "./app";
import prisma from "./config/database";

const PORT = Number(process.env.PORT) || 3000;

async function tryConnect(retries: number, delay: number): Promise<boolean> {
  for (let i = 1; i <= retries; i++) {
    try {
      await prisma.$queryRawUnsafe("SELECT 1");
      return true;
    } catch {
      if (i < retries) {
        console.log(`Database not reachable — retrying in ${delay / 1000}s (${i}/${retries})`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  return false;
}

async function start(): Promise<void> {
  const connected = await tryConnect(3, 3000);

  if (connected) {
    console.log("Connected to database");
  } else {
    console.log("Not connected to database");
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log("Database connection closed");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  prisma.$disconnect();
  process.exit(1);
});

export default start;
