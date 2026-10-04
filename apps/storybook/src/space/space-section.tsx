import { semantic } from "@/shared/token-groups.js";
import { TokensPage } from "@/shared/tokens-page.js";
import "./space.css";

export function SpaceSection() {
  return (
    <TokensPage>
      <section>
        <h2>Space</h2>
        <div className="tokens-rows">
          {semantic("space").map((entry) => (
            <div key={entry.name} className="tokens-row">
              <code>{entry.variable}</code>
              <span className="tokens-bar" style={{ width: `var(${entry.variable})` }} />
            </div>
          ))}
        </div>
      </section>
    </TokensPage>
  );
}
