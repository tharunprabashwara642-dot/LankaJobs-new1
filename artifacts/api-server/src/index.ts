import app from "./app";
import { logger } from "./lib/logger";
import { seedDefaults } from "./lib/seed";

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

void seedDefaults()
  .then(
    () =>
      new Promise<void>((resolve) => {
        app.listen(port, (err) => {
          if (err) {
            logger.error({ err }, "Error listening on port");
            process.exit(1);
          }
          logger.info({ port }, "Server listening");
          resolve();
        });
      }),
  )
  .catch((error) => {
    logger.error({ error }, "Unable to initialise database defaults");
    process.exit(1);
  });
