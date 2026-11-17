import { useRef } from "react";
import type { TokenEntry } from "@/shared/token-groups.js";
import { useResolvedBackground } from "@/shared/use-resolved-background.js";
import "./color.css";

export function Swatch({ entry }: { entry: TokenEntry }) {
  const ref = useRef<HTMLSpanElement>(null);
  const value = useResolvedBackground(ref);

  return (
    <div className="tokens-swatch">
      <span
        ref={ref}
        className="tokens-swatch-color"
        style={{ background: `var(${entry.variable})` }}
      />
      <code className="tokens-swatch-name">{entry.variable}</code>
      <span className="tokens-swatch-value">{value}</span>
    </div>
  );
}
