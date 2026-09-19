import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { connectDB } from "./utils/connectDB.js";

const config = loadConfig();

await connectDB(config.mongoUri);
console.log("MongoDB connected");

createApp({ jwtSecret: config.jwtSecret, clientOrigin: config.clientOrigin }).listen(config.port, () =>
  console.log(`Server running on port ${config.port}`)
);
