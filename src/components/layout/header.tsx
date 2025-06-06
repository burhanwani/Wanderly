"use client";
import * as React from "react";

import { cn, getInitials } from "@/lib/utils/ui.utils";
import { MessageSquarePlus, MoonIcon, SunIcon } from "lucide-react";
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
import { sendGAEvent } from "../../lib/config/google-analytics/google-analytics.config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const HeaderRightContent = () => {
  return (
    <div className={"flex gap-x-2"}>
      <FeedbackFlow />
      <ThemeSetter />
      <AuthenticationFlow />
    </div>
  );
};

const FeedbackFlow = () => {
  "use client";
  const router = useRouter();
  const { data: session } = useSession();
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"outline"}
            onClick={() => {
              sendGAEvent(
                "Feedback",
                "User clicked on Feedback button",
                "User clicked on Feedback button",
                session?.user?.id
              );
              router.push(ROUTES_CONSTANTS.feedback);
            }}
            size={"icon"}
          >
            <MessageSquarePlus className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Feedback</TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
            onClick={() => {
              sendGAEvent(
                "My_Trips",
                "All trips page for user",
                "Load all trip",
                session?.user?.id
              );
              router.push(ROUTES_CONSTANTS.trips);
            }}
            className="cursor-pointer"
          >
            My Trips
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              sendGAEvent(
                "Sign_Out",
                "User signed out",
                "User signed out",
                session?.user?.id
              );
              signOut({
                callbackUrl: ROUTES_CONSTANTS.home,
                redirect: true,
              });
            }}
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
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              theme == "light" ? setTheme("dark") : setTheme("light")
            }
          >
            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Toggle theme</TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
