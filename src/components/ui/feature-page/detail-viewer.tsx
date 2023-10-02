import { nanoid } from "nanoid";
import { useMemo } from "react";
import {
  TypographyH3,
  TypographyH4,
  TypographyList,
  TypographyP,
} from "../typography";

interface IDetailViewerProps {
  detail: string | string[];
  heading?: string;
}

function DetailViewer({ detail = "-", heading = "" }: IDetailViewerProps) {
  const isArray = useMemo(() => Array.isArray(detail), [detail]);
  const detailsArray = useMemo(
    () =>
      Array.isArray(detail)
        ? detail.map((d) => ({ detail: d, id: nanoid() }))
        : [],
    [detail],
  );
  const headingComponent = useMemo(() => {
    return heading ? <TypographyH4>{heading}</TypographyH4> : "";
  }, [heading]);
  if (isArray) {
    if (detailsArray.length == 0) return "-";
    return (
      <div>
        {headingComponent}
        <TypographyList>
          {detailsArray?.map((tip) => <li key={tip.id}>{tip.detail}</li>) ??
            "-"}
        </TypographyList>
      </div>
    );
  }
  return (
    <div>
      {headingComponent}
      <TypographyP>{detail}</TypographyP>
    </div>
  );
}
DetailViewer.displayName = "DetailViewer";

export { DetailViewer };
