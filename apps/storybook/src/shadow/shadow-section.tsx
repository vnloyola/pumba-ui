import { semantic } from "@/shared/token-groups.js";
import { TokensPage } from "@/shared/tokens-page.js";

export function ShadowSection() {
  return (
    <TokensPage>
      <section>
        <h2>Shadow</h2>
        <div className="tokens-boxes">
          {semantic("shadow").map((entry) => (
            <figure key={entry.name}>
              <span className="tokens-box" style={{ boxShadow: `var(${entry.variable})` }} />
              <code>{entry.variable}</code>
            </figure>
          ))}
        </div>
      </section>
    </TokensPage>
  );
}
