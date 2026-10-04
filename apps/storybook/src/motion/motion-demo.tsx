import { type CSSProperties, useState } from "react";
import "./motion.css";

type MotionDemoProps = {
  duration: string;
  easing: string;
};

export function MotionDemo({ duration, easing }: MotionDemoProps) {
  const [moved, setMoved] = useState(false);
  const trackStyle = {
    "--duration": `var(${duration})`,
    "--easing": `var(${easing})`,
  } as CSSProperties;

  return (
    <div className="tokens-motion" data-moved={moved || undefined}>
      <code>{`${duration} / ${easing}`}</code>
      <div className="tokens-motion-track" style={trackStyle}>
        <span className="tokens-motion-dot" />
      </div>
      <button type="button" className="tokens-motion-button" onClick={() => setMoved(!moved)}>
        Play
      </button>
    </div>
  );
}
