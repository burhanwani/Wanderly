import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { ROUTES_CONSTANTS } from "../../constants/routes.constants";
import firebaseAdmin from "../firebase/firebase-admin.config";

const emailWhiteList = [
  "manojcchoudhary@gmail.com",
  "himanilgole@gmail.com",
  "shek.m.aamir@gmail.com",
  "burhan.ayub@gmail.com",
];

export const nextAuthOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process?.env?.GOOGLE_ID ?? "",
      clientSecret: process?.env?.GOOGLE_SECRET ?? "",
    }),
  ],
  adapter: FirestoreAdapter(firebaseAdmin.firestore()),
  callbacks: {
    async signIn(params) {
      const isWhiteListed = emailWhiteList.includes(params?.user?.email || "");
      if (isWhiteListed) {
        return true;
      } else {
        // Return false to display a default error message
        // return false;
        // Or you can return a URL to redirect to:
        return "/unauthorized";
      }
    },
    async session(param) {
      const { session, user } = param;
      session.user = user;
      return session;
    },
  },
  pages: {
    signOut: ROUTES_CONSTANTS.signOutPage,
  },
};
