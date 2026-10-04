import { colorScales, semantic } from "@/shared/token-groups.js";
import { TokensPage } from "@/shared/tokens-page.js";
import { Swatch } from "./swatch.js";

export function ColorSection() {
  return (
    <TokensPage>
      <section>
        <h2>Semantic colors</h2>
        <div className="tokens-grid">
          {semantic("color").map((entry) => (
            <Swatch key={entry.name} entry={entry} />
          ))}
        </div>
      </section>
      <section>
        <h2>Primitive colors</h2>
        <div className="tokens-scales">
          {Object.entries(colorScales()).map(([scale, entries]) => (
            <div key={scale}>
              <h3>{scale}</h3>
              <div className="tokens-scale">
                {entries.map((entry) => (
                  <Swatch key={entry.name} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </TokensPage>
  );
}
