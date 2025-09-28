import { randomBytes } from "node:crypto";

const providedSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
const isProduction = process.env.NODE_ENV === "production";
const isHostedEnvironment = Boolean(
  process.env.VERCEL ?? process.env.NETLIFY ?? process.env.NEXTAUTH_URL ?? process.env.CI,
);

const fallbackSecret = providedSecret ??
  (isProduction && isHostedEnvironment
    ? undefined
    : process.env.NEXTAUTH_SECRET_FALLBACK ?? "development-secret");

const authSecret = fallbackSecret ?? randomBytes(32).toString("hex");

if (!providedSecret && isProduction && isHostedEnvironment) {
  throw new Error("NEXTAUTH_SECRET (or AUTH_SECRET) must be defined in production environments.");
}

export const env = {
  authSecret,
  hasUserProvidedAuthSecret: Boolean(providedSecret),
};
