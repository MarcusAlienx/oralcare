import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Connect to WhatsApp after server is ready
  try {
    const { connectToWhatsApp } = await import("./services/whatsappService.js");
    await connectToWhatsApp();
    logger.info({}, "WhatsApp connected");
  } catch (err) {
    logger.error({ err }, "WhatsApp connection failed");
  }
});
