"use client";
import { signIn, useSession } from "next-auth/react";
import AuthChecker, { IAuthChecker } from "./auth";
import appConfigSlice from "../../redux/features/auth.slice";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "../../redux/hooks";
import { isAdminUser } from "../../lib/config/app/app.config";

export default function AdminAuth({ children }: IAuthChecker) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const session = useSession({
    required: true,
    onUnauthenticated: () => {
      dispatch(appConfigSlice.actions.clearCache());
      signIn("google", {
        callbackUrl: pathname,
      });
    },
  });
  return (
    <AuthChecker skipTripsFetch={true}>
      {isAdminUser(session) ? children : "Unauthorized"}
    </AuthChecker>
  );
}
