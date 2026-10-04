import { semantic } from "@/shared/token-groups.js";
import { TokensPage } from "@/shared/tokens-page.js";
import { MotionDemo } from "./motion-demo.js";

export function MotionSection() {
  const durations = semantic("motion-duration");
  const easings = semantic("motion-easing");

  return (
    <TokensPage>
      <section>
        <h2>Motion</h2>
        <div className="tokens-rows">
          {durations.flatMap((duration) =>
            easings.map((easing) => (
              <MotionDemo
                key={`${duration.name}-${easing.name}`}
                duration={duration.variable}
                easing={easing.variable}
              />
            )),
          )}
        </div>
      </section>
    </TokensPage>
  );
}
