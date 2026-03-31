import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import pool from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await pool.query(
          "SELECT id, email, password_hash FROM users WHERE email = $1",
          [credentials.email]
        );

        const user = result.rows[0];
        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );
        if (!valid) return null;

        return { id: String(user.id), email: user.email };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
