import bcrypt from "bcryptjs";
import NextAuth, { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import type { IncomingHttpHeaders } from "http";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

type NextAuthConfig = Parameters<typeof NextAuth>[2];
type CredentialsInput = Record<"email" | "password", string> | undefined;
type AuthorizeRequest = {
  headers?: IncomingHttpHeaders;
};

function normalizeHeader(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export const authOptions: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Correo y contraseña",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials: CredentialsInput, request?: AuthorizeRequest) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            teamMember: true,
          },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        let teamMemberId = user.teamMember?.id ?? null;

        if (!user.teamMember && user.role !== "admin") {
          const created = await prisma.teamMember.create({
            data: {
              name: user.name ?? user.email,
              email: user.email,
              role: user.role ?? "Colaborador",
              userId: user.id,
            },
          });
          teamMemberId = created.id;
        } else if (user.teamMember && user.teamMember.userId !== user.id) {
          await prisma.teamMember.update({
            where: { id: user.teamMember.id },
            data: { userId: user.id },
          });
          teamMemberId = user.teamMember.id;
        }

        const ipHeader =
          normalizeHeader(request?.headers?.["x-forwarded-for"]) ??
          normalizeHeader(request?.headers?.["x-real-ip"]);
        const ipAddress = ipHeader?.split(",")[0]?.trim();
        const userAgent = normalizeHeader(request?.headers?.["user-agent"]);

        try {
          await prisma.sessionLog.create({
            data: {
              userId: user.id,
              email: user.email,
              ipAddress: ipAddress ?? null,
              userAgent: userAgent ?? null,
            },
          });
        } catch (error) {
          console.error("sessionLog.create", error);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role ?? "member",
          teamMemberId,
        };
      },
    }),
  ],
  secret: env.authSecret,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as typeof user & {
          id: string;
          email: string;
          name?: string | null;
          role?: string | null;
          teamMemberId?: number | null;
        };

        token.id = typedUser.id;
        token.email = typedUser.email;
        token.name = typedUser.name;
        token.role = typedUser.role ?? "member";
        token.teamMemberId = typedUser.teamMemberId ?? null;
        return token;
      }

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          include: {
            teamMember: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.role = dbUser.role ?? "member";
          token.teamMemberId = dbUser.teamMember?.id ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        return session;
      }

      const enrichedUser = session.user as typeof session.user & {
        id?: string;
        role?: string | null;
        teamMemberId?: number | null;
      };

      enrichedUser.id = typeof token.id === "string" ? token.id : enrichedUser.id;
      enrichedUser.role = (token.role as string | undefined) ?? enrichedUser.role ?? "member";
      session.user.email = (token.email as string | undefined) ?? session.user.email;
      session.user.name = (token.name as string | undefined) ?? session.user.name;
      enrichedUser.teamMemberId = typeof token.teamMemberId === "number" ? token.teamMemberId : null;

      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}

export const authHandler = NextAuth(authOptions);
