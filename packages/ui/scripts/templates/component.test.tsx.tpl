import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { __Name__ } from "./__name__.js";

describe("__Name__", () => {
  it("renders its class and the default variant and size", () => {
    render(<__Name__>Content</__Name__>);
    const element = screen.getByText("Content");
    expect(element.classList.contains("pumba-__name__")).toBe(true);
    expect(element.getAttribute("data-variant")).toBe("default");
    expect(element.getAttribute("data-size")).toBe("md");
  });

  it("appends the consumer className to its own", () => {
    render(<__Name__ className="custom">Content</__Name__>);
    const element = screen.getByText("Content");
    expect(element.classList.contains("pumba-__name__")).toBe(true);
    expect(element.classList.contains("custom")).toBe(true);
  });

  it("forwards the ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<__Name__ ref={ref}>Content</__Name__>);
    expect(ref.current).toBe(screen.getByText("Content"));
  });

  it("keeps its class, data attributes and ref with render={<a />}", () => {
    let node: HTMLElement | null = null;
    render(
      <__Name__
        ref={(element) => {
          node = element;
        }}
        render={<a href="/docs" />}
      >
        Docs
      </__Name__>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.classList.contains("pumba-__name__")).toBe(true);
    expect(link.getAttribute("data-variant")).toBe("default");
    expect(link.getAttribute("data-size")).toBe("md");
    expect(node).toBe(link);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<__Name__>Content</__Name__>);
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
