import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Card } from "./card.js";

const parts = [
  ["Root", Card.Root, "pumba-card"],
  ["Header", Card.Header, "pumba-card-header"],
  ["Content", Card.Content, "pumba-card-content"],
  ["Footer", Card.Footer, "pumba-card-footer"],
] as const;

describe.each(parts)("Card.%s", (_name, Part, className) => {
  it("renders its class", () => {
    render(<Part>Content</Part>);
    expect(screen.getByText("Content").classList.contains(className)).toBe(true);
  });

  it("appends the consumer className to its own", () => {
    render(<Part className="custom">Content</Part>);
    const element = screen.getByText("Content");
    expect(element.classList.contains(className)).toBe(true);
    expect(element.classList.contains("custom")).toBe(true);
  });

  it("forwards the ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Part ref={ref}>Content</Part>);
    expect(ref.current).toBe(screen.getByText("Content"));
  });

  it("keeps its class and ref with render={<a />}", () => {
    let node: HTMLElement | null = null;
    render(
      <Part
        ref={(element) => {
          node = element;
        }}
        render={<a href="/docs" />}
      >
        Docs
      </Part>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.classList.contains(className)).toBe(true);
    expect(node).toBe(link);
  });
});

describe("Card", () => {
  it("composes header, content and footer", () => {
    render(
      <Card.Root>
        <Card.Header>Header</Card.Header>
        <Card.Content>Content</Card.Content>
        <Card.Footer>Footer</Card.Footer>
      </Card.Root>,
    );
    const root = screen.getByText("Header").parentElement;
    expect(root?.classList.contains("pumba-card")).toBe(true);
    expect([...(root?.children ?? [])].map((child) => child.textContent)).toEqual([
      "Header",
      "Content",
      "Footer",
    ]);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Card.Root>
        <Card.Header>
          <h3>Revenue</h3>
        </Card.Header>
        <Card.Content>
          <p>Total for the month</p>
        </Card.Content>
        <Card.Footer>
          <button type="button">Details</button>
        </Card.Footer>
      </Card.Root>,
    );
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
