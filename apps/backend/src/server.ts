import 'dotenv/config';
import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { config } from './config/env.js';

async function main(): Promise<void> {
  await connectDb();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
