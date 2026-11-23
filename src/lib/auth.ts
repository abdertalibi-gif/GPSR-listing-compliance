import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { loginSchema } from "@/lib/validations/auth";

const globalForAuth = globalThis as unknown as { __authFallbackSecret?: string };
function getAuthSecret(): string {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (!globalForAuth.__authFallbackSecret) {
    globalForAuth.__authFallbackSecret = randomBytes(32).toString("hex");
  }
  return globalForAuth.__authFallbackSecret;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: getAuthSecret(),
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        let user: Awaited<ReturnType<typeof prisma.user.findUnique>> = null;
        try {
          user = await prisma.user.findUnique({ where: { email } });
        } catch (e) {
          console.error("[auth][authorize] db error", e);
          return null;
        }
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        if (!user.isActive) return null;
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: user.image ?? undefined,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (user) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
          if (dbUser) {
            (token as unknown as Record<string, unknown>).role = dbUser.role;
          }
        } catch (e) {
          console.error("[auth][jwt] db error", e);
          // keep existing token role, do not crash
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        (session.user as unknown as { id: string }).id = token.sub;
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
          if (dbUser) {
            (session.user as unknown as Record<string, unknown>).role = dbUser.role;
            session.user.name = `${dbUser.firstName} ${dbUser.lastName}`;
            session.user.email = dbUser.email;
          } else {
            // user no longer exists → keep token role but mark email/name from token if available
            // Do not create fake user; session remains with sub but no db data
            console.warn("[auth][session] user not found for token.sub", token.sub);
            if (!(session.user as unknown as Record<string, unknown>).role) {
              (session.user as unknown as Record<string, unknown>).role = (token as unknown as Record<string, unknown>).role ?? "USER";
            }
          }
        } catch (e) {
          console.error("[auth][session] db error", e);
          // graceful fallback: use token role without crashing
          if (!(session.user as unknown as Record<string, unknown>).role) {
            (session.user as unknown as Record<string, unknown>).role = (token as unknown as Record<string, unknown>).role ?? "USER";
          }
        }
        if (!(session.user as unknown as Record<string, unknown>).role) {
          (session.user as unknown as Record<string, unknown>).role = (token as unknown as Record<string, unknown>).role ?? "USER";
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
