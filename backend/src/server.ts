import app from "./app";
import prisma from "./config/database";

const PORT = Number(process.env.PORT) || 3000;

async function start(): Promise<void> {
  await prisma.$connect();
  console.log("Connected to database");

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
