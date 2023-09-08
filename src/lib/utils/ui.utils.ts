import { clsx, type ClassValue } from "clsx";
import humanizeDuration from "humanize-duration";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  // Split the name into separate words
  const words = name.split(" ");

  // Extract the first character of the first two words
  const initials = words.slice(0, 2).map((word) => word.charAt(0));

  // Join the initials together and return the result
  return initials.join("");
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

export const onlyDigitWithOutText = humanizeDuration.humanizer({
  language: "shortEn",
  languages: {
    shortEn: {
      y: () => "",
      mo: () => "",
      w: () => "",
      d: () => "",
      h: () => "",
      m: () => "",
      s: () => "",
      ms: () => "",
    },
  },
});

export const consolePrinter = (callBack = () => console.log("Print Me")) => {
  if (process.env.NODE_ENV == "development") callBack();
};
