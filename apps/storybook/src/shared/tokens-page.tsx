import type { ReactNode } from "react";
import "./tokens-page.css";

export function TokensPage({ children }: { children: ReactNode }) {
  return <div className="tokens-page">{children}</div>;
}
