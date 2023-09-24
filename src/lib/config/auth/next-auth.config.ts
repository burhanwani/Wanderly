import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { ROUTES_CONSTANTS } from "../../constants/routes.constants";
import { isAdminUser } from "../app/app.config";
import firebaseAdmin from "../firebase/firebase-admin.config";

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
      return true;
    },
    async session(param) {
      const { session, user } = param;
      const isAdmin = isAdminUser(user.email);
      session.user = { ...user, isAdmin };
      return session;
    },
  },
  pages: {
    signOut: ROUTES_CONSTANTS.signOutPage,
  },
};
