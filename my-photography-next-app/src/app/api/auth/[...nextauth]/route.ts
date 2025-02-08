import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { authConfig } from "@/lib/auth"; // If you have a separate config

export const { handlers, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});

export const GET = handlers.GET;
export const POST = handlers.POST;



// GOOGLE_CLIENT_ID=your-google-client-id
// GOOGLE_CLIENT_SECRET=your-google-client-secret
// NEXTAUTH_URL=https://your-vercel-app.vercel.app
// NEXTAUTH_SECRET=your-random-secret
// DATABASE_URL=your-database-url (if using a DB)
// AWS_ACCESS_KEY_ID=your-aws-key
// AWS_SECRET_ACCESS_KEY=your-aws-secret
// AWS_REGION=your-aws-region