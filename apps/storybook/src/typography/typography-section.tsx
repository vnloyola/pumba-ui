import type { CSSProperties } from "react";
import { primitive, textStyles } from "@/shared/token-groups.js";
import { TokensPage } from "@/shared/tokens-page.js";
import "./typography.css";

const TEXT_PROPERTIES = [
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
];

const toCamelCase = (property: string) =>
  property.replace(/-./g, (match) => (match[1] ?? "").toUpperCase());

const textStyle = (style: string): CSSProperties =>
  Object.fromEntries(
    TEXT_PROPERTIES.map((property) => [
      toCamelCase(property),
      `var(--pumba-text-${style}-${property})`,
    ]),
  );

export function TypographySection() {
  return (
    <TokensPage>
      <section>
        <h2>Text styles</h2>
        {textStyles().map((style) => (
          <div key={style} className="tokens-text">
            <code>{`--pumba-text-${style}-*`}</code>
            <span style={textStyle(style)}>The quick brown fox jumps over the lazy dog</span>
          </div>
        ))}
      </section>
      <section>
        <h2>Font sizes</h2>
        {primitive("font-size").map((entry) => (
          <div key={entry.name} className="tokens-text">
            <code>{entry.variable}</code>
            <span style={{ fontSize: `var(${entry.variable})` }}>Pumba design system</span>
          </div>
        ))}
      </section>
    </TokensPage>
  );
}
