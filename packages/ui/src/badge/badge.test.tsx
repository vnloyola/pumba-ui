import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge.js";

const variants = ["neutral", "accent", "success", "error", "warning"] as const;

describe("Badge", () => {
  it("renders its class and the default variant and size", () => {
    render(<Badge>Draft</Badge>);
    const badge = screen.getByText("Draft");
    expect(badge.tagName).toBe("SPAN");
    expect(badge.classList.contains("pumba-badge")).toBe(true);
    expect(badge.getAttribute("data-variant")).toBe("neutral");
    expect(badge.getAttribute("data-size")).toBe("md");
  });

  it.each(variants)("reflects the %s variant and the sm size as data attributes", (variant) => {
    render(
      <Badge variant={variant} size="sm">
        {variant}
      </Badge>,
    );
    const badge = screen.getByText(variant);
    expect(badge.getAttribute("data-variant")).toBe(variant);
    expect(badge.getAttribute("data-size")).toBe("sm");
  });

  it("appends the consumer className to its own", () => {
    render(<Badge className="custom">Draft</Badge>);
    const badge = screen.getByText("Draft");
    expect(badge.classList.contains("pumba-badge")).toBe(true);
    expect(badge.classList.contains("custom")).toBe(true);
  });

  it("forwards the ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>Draft</Badge>);
    expect(ref.current).toBe(screen.getByText("Draft"));
  });

  it("keeps its class, data attributes and ref with render={<a />}", () => {
    let node: HTMLElement | null = null;
    render(
      <Badge
        ref={(element) => {
          node = element;
        }}
        render={<a href="/changelog" />}
      >
        New
      </Badge>,
    );
    const link = screen.getByRole("link", { name: "New" });
    expect(link.classList.contains("pumba-badge")).toBe(true);
    expect(link.getAttribute("data-variant")).toBe("neutral");
    expect(link.getAttribute("data-size")).toBe("md");
    expect(node).toBe(link);
  });

  it("has no accessibility violations in any variant", async () => {
    const { container } = render(
      <div>
        {variants.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </div>,
    );
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
