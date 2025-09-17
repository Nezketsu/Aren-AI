import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import type { Account, Profile, Session, User } from "next-auth"

const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: "database" as const,
  },
  callbacks: {
    async signIn({ user, account, profile }: { user: User; account: Account | null; profile?: Profile; email?: { verificationRequest?: boolean }; credentials?: Record<string, unknown> }) {
      // Only allow users with a non-null, non-undefined email
      if (user && typeof user.email === "string" && user.email) {
        return true;
      }
      return false;
    },
    async session({ session, user, token }: { session: Session; user?: User; token?: any }) {
      // Attach user id and email to session
      if (session.user) {
        // Prefer user.id if available, else fallback to token.sub (for JWT strategy)
        session.user.id = user?.id || token?.sub || null;
        session.user.email = user?.email || token?.email || session.user.email;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Always redirect to home after login
      return baseUrl;
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
