/**
 * Validates that all required environment variables are set.
 * Logs structured warnings or throws depending on criticality.
 */
export function validateEnv() {
  const required = [
    "MONGODB_URI",
    "JWT_SECRET",
    "GEMINI_API_KEY"
  ];

  const missing = [];
  for (const env of required) {
    if (!process.env[env]) {
      missing.push(env);
    }
  }

  if (missing.length > 0) {
    const errorMsg = `[Rezumix Startup Error]: Missing required environment variables: ${missing.join(", ")}`;
    console.error("\x1b[31m%s\x1b[0m", errorMsg);
    if (process.env.NODE_ENV === "production") {
      throw new Error(errorMsg);
    }
  } else {
    console.log("\x1b[32m%s\x1b[0m", "[Rezumix]: All critical environment variables validated.");
  }
}
