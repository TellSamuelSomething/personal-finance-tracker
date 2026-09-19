const MIN_SECRET_LENGTH = 32;

/** Reads and validates the environment, so a misconfigured server fails at startup with a clear message. */
export function loadConfig(env = process.env) {
  const missing = ["MONGO_URI", "JWT_SECRET"].filter((name) => !env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}. See server/.env.example.`);
  }
  if (env.JWT_SECRET.length < MIN_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters long.`);
  }

  return {
    port: Number(env.PORT) || 5000,
    mongoUri: env.MONGO_URI,
    jwtSecret: env.JWT_SECRET,
    clientOrigin: env.CLIENT_ORIGIN || "http://localhost:5173",
  };
}
