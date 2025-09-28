import { randomBytes } from "node:crypto";

const providedSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
const isProduction = process.env.NODE_ENV === "production";
const isHostedEnvironment = Boolean(process.env.VERCEL ?? process.env.NETLIFY ?? process.env.NEXTAUTH_URL);

const fallbackSecret =
  providedSecret ?? process.env.NEXTAUTH_SECRET_FALLBACK ?? (isProduction ? randomBytes(32).toString("hex") : "development-secret");

const authSecret = fallbackSecret;

if (!providedSecret && isProduction) {
  const target = isHostedEnvironment ? "hosted" : "local";
  console.warn(
    `NEXTAUTH_SECRET (or AUTH_SECRET) is not set for the ${target} production build. A temporary secret was generated. ` +
      "Generate and configure a persistent secret to avoid invalidating sessions on deploy.",
  );
}

export const env = {
  authSecret,
  hasUserProvidedAuthSecret: Boolean(providedSecret),
};
