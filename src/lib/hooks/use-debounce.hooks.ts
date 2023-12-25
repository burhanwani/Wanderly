import { useEffect, useState } from "react";

const TWO_SECONDS = 2000;
export function useDebounce<T>(value: T, delay: number = TWO_SECONDS) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
