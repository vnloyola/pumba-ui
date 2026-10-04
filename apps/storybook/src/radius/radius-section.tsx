import { semantic } from "@/shared/token-groups.js";
import { TokensPage } from "@/shared/tokens-page.js";

export function RadiusSection() {
  return (
    <TokensPage>
      <section>
        <h2>Radius</h2>
        <div className="tokens-boxes">
          {semantic("radius").map((entry) => (
            <figure key={entry.name}>
              <span className="tokens-box" style={{ borderRadius: `var(${entry.variable})` }} />
              <code>{entry.variable}</code>
            </figure>
          ))}
        </div>
      </section>
    </TokensPage>
  );
}
