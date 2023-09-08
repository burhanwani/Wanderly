"use client";

import { SessionProvider } from "next-auth/react";

interface INextAuthSessionProvider {
  children: React.ReactNode;
}
export default function NextAuthSessionProvider({
  children,
}: INextAuthSessionProvider) {
  return <SessionProvider>{children}</SessionProvider>;
}
