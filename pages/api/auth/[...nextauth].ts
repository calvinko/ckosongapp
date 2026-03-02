import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/auth-mongodb";
import type { NextAuthOptions } from 'next-auth'

export const AUTH_OPTIONS: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.includes("songapp.vercel.app") || url.includes("songs.timothyko.org") || url.includes("localhost:3000") || url.includes("192.168.4.111:3000")) {
        return url;
      }
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl
    }
  },

  // A database is optional, but required to persist accounts in a database
  adapter: MongoDBAdapter(clientPromise),
}

/**
 * Set up for Next Auth
 */
export default NextAuth(AUTH_OPTIONS);
