import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Add this line to include 'id'
    } & DefaultSession["user"];
  }
}
