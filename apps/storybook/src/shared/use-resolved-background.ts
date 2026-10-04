import { type RefObject, useEffect, useState } from "react";

export function useResolvedBackground(ref: RefObject<HTMLElement | null>): string {
  const [value, setValue] = useState("");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const read = () => setValue(getComputedStyle(element).backgroundColor);
    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const media = matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", read);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", read);
    };
  }, [ref]);

  return value;
}
