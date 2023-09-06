import { Main } from "../../components/layout/main";
import { TypographyH3 } from "../../components/ui/typography";

export default function MaxRateLimit() {
  return (
    <Main className="items-center justify-center">
      <TypographyH3> Too Many Request. Please try again later.</TypographyH3>
    </Main>
  );
}
