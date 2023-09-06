"use client";

import { Player } from "@lottiefiles/react-lottie-player";
import { cn } from "../../lib/utils/ui.utils";

interface IConciergePlayerProps {
  url: string;
  className?: string;
}

const ConciergePlayer = ({ url, className }: IConciergePlayerProps) => (
  <Player src={url} loop autoplay className={cn(className)} />
);
ConciergePlayer.displayName = "ConciergePlayer";

export { ConciergePlayer };
