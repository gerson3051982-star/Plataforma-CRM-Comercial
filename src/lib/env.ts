const authSecret =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV !== "production" ? "development-secret" : undefined);

if (!authSecret) {
  throw new Error("NEXTAUTH_SECRET (or AUTH_SECRET) must be defined in production environments.");
}

export const env = {
  authSecret,
};
