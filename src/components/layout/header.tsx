"use client";
import * as React from "react";

import { cn, getInitials } from "@/lib/utils/ui.utils";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Logo } from "../ui/logo";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Skeleton } from "../ui/skeleton";
import { ROUTES_CONSTANTS } from "../../lib/constants/routes.constants";
import { useRouter } from "next/navigation";
import { AUTH_SIGN_OPTION } from "../../lib/constants/auth.constants";

const HeaderRightContent = () => {
  return (
    <div className={"flex gap-x-2"}>
      <AuthenticationFlow />
      <ThemeSetter />
    </div>
  );
};

const AuthenticationFlow = () => {
  "use client";
  const router = useRouter();
  const { data: session, status } = useSession();
  if (status == "loading") return <Skeleton className="h-8 w-8 rounded-full" />;
  if (session) {
    const initial = getInitials(session?.user?.name || "");
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size={"icon"}>
            <Avatar>
              <AvatarImage
                className="rounded-full h-8"
                src={session?.user?.image ?? undefined}
                alt={initial}
              />
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-36">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push(ROUTES_CONSTANTS.trips)}
            className="cursor-pointer"
          >
            My Trips
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              signOut({
                callbackUrl: ROUTES_CONSTANTS.home,
                redirect: true,
              })
            }
            className="cursor-pointer"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <Button
      variant={"default"}
      onClick={() => signIn(AUTH_SIGN_OPTION.DEFAULT)}
    >
      Login
    </Button>
  );
};

const ThemeSetter = React.memo(() => {
  "use client";
  const { setTheme, theme = "light" } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => (theme == "light" ? setTheme("dark") : setTheme("light"))}
    >
      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
});
ThemeSetter.displayName = "ThemeSetter";

const Header = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const router = useRouter();
  return (
    <header
      ref={ref}
      className={cn(
        "bg-background border-b fixed w-full lg:overflow-y-visible h-header flex items-center justify-between px-4 sm:px-6 lg:px-8 z-50",
        className
      )}
      {...props}
    >
      <Logo onClick={() => router.push("/")} className="cursor-pointer" />
      <HeaderRightContent />
    </header>
  );
});
Header.displayName = "Header";

export { Header };
