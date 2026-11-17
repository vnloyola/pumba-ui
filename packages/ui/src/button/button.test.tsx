import { fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { CheckIcon } from "../icons.js";
import { Button } from "./button.js";

const axeOptions = { rules: { "color-contrast": { enabled: false } } };

describe("Button", () => {
  it("renders its class and the default variant and size", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.classList.contains("pumba-button")).toBe(true);
    expect(button.getAttribute("data-variant")).toBe("primary");
    expect(button.getAttribute("data-size")).toBe("md");
  });

  it("reflects variant and size as data attributes", () => {
    render(
      <Button variant="ghost" size="lg">
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.getAttribute("data-variant")).toBe("ghost");
    expect(button.getAttribute("data-size")).toBe("lg");
  });

  it("appends the consumer className to its own", () => {
    render(<Button className="custom">Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.classList.contains("pumba-button")).toBe(true);
    expect(button.classList.contains("custom")).toBe(true);
  });

  it("forwards the ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Save</Button>);
    expect(ref.current).toBe(screen.getByRole("button", { name: "Save" }));
  });

  it("keeps its class, data attributes and ref with render={<a />}", () => {
    let node: HTMLElement | null = null;
    render(
      <Button
        ref={(element) => {
          node = element;
        }}
        render={<a href="/docs" />}
      >
        Docs
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.classList.contains("pumba-button")).toBe(true);
    expect(link.getAttribute("data-variant")).toBe("primary");
    expect(link.getAttribute("data-size")).toBe("md");
    expect(node).toBe(link);
  });

  it("calls onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    fireEvent.click(button);
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(button.hasAttribute("data-disabled")).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("is busy and ignores clicks while loading, and stays focusable", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    fireEvent.click(button);
    button.focus();
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.hasAttribute("data-loading")).toBe(true);
    expect(document.activeElement).toBe(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps icons placed in children in order", () => {
    render(
      <Button>
        <CheckIcon data-testid="start" aria-hidden="true" />
        Save
        <CheckIcon data-testid="end" aria-hidden="true" />
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.firstElementChild).toBe(screen.getByTestId("start"));
    expect(button.lastElementChild).toBe(screen.getByTestId("end"));
  });

  it("marks icon-only buttons and keeps their accessible name", () => {
    render(
      <Button iconOnly aria-label="Confirm">
        <CheckIcon aria-hidden="true" />
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Confirm" });
    expect(button.hasAttribute("data-icon-only")).toBe(true);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Button>Save</Button>);
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("has no accessibility violations when disabled or loading", async () => {
    const { container } = render(
      <>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
        <Button iconOnly aria-label="Confirm">
          <CheckIcon aria-hidden="true" />
        </Button>
      </>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });
});
