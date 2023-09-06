import { useMemo } from "react";
import { ConciergePlayer } from "./player";
import { getRandomLoader } from "../../lib/config/ui/loaders.ui.config";
import { Card } from "./card";

export default function Loader() {
  const animationUrl = useMemo(() => getRandomLoader(), []);
  return (
    <Card>
      <ConciergePlayer url={animationUrl} className="w-80" />
    </Card>
  );
}
