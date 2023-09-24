import { ReactNode, useMemo } from "react";
import { ConciergePlayer } from "./player";
import { getRandomLoader } from "../../lib/config/ui/loaders.ui.config";
import { Card } from "./card";

interface LoaderProps {
  children?: ReactNode;
}

export default function Loader(props: LoaderProps) {
  const animationUrl = useMemo(() => getRandomLoader(), []);
  return (
    <Card>
      <ConciergePlayer url={animationUrl} className="w-80" />
      {props?.children ? props?.children : null}
    </Card>
  );
}
