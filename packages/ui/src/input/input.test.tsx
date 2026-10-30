import { fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { createRef, useState } from "react";
import { describe, expect, it } from "vitest";
import { Input } from "./input.js";

const axeOptions = { rules: { "color-contrast": { enabled: false } } };

describe("Input", () => {
  it("renders an input with its class and the default size", () => {
    render(<Input aria-label="Email" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input.tagName).toBe("INPUT");
    expect(input.classList.contains("pumba-input")).toBe(true);
    expect(input.getAttribute("data-size")).toBe("md");
  });

  it("reflects the size as a data attribute and leaves the native size alone", () => {
    render(<Input aria-label="Email" size="lg" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input.getAttribute("data-size")).toBe("lg");
    expect(input.hasAttribute("size")).toBe(false);
  });

  it("appends the consumer className to its own", () => {
    render(<Input aria-label="Email" className="custom" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input.classList.contains("pumba-input")).toBe(true);
    expect(input.classList.contains("custom")).toBe(true);
  });

  it("forwards the ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input aria-label="Email" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole("textbox", { name: "Email" }));
  });

  it("keeps its class, data attributes and ref with render={<a />}", () => {
    let node: HTMLElement | null = null;
    render(
      <Input
        ref={(element) => {
          node = element;
        }}
        render={<a href="/docs" />}
      >
        Docs
      </Input>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.classList.contains("pumba-input")).toBe(true);
    expect(link.getAttribute("data-size")).toBe("md");
    expect(node).toBe(link);
  });

  it("works uncontrolled with defaultValue", () => {
    render(<Input aria-label="Email" defaultValue="ana@example.com" />);
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "Email" });
    expect(input.value).toBe("ana@example.com");
    fireEvent.change(input, { target: { value: "bo@example.com" } });
    expect(input.value).toBe("bo@example.com");
  });

  it("works controlled with value and onChange", () => {
    function Controlled() {
      const [value, setValue] = useState("one");
      return (
        <>
          <Input
            aria-label="Email"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), { target: { value: "two" } });
    expect(screen.getByRole("status").textContent).toBe("two");
  });

  it("marks an invalid input for assistive technology and styling", () => {
    render(<Input aria-label="Email" invalid />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.hasAttribute("data-invalid")).toBe(true);
  });

  it("does not mark a valid input as invalid", () => {
    render(<Input aria-label="Email" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.hasAttribute("data-invalid")).toBe(false);
  });

  it("marks disabled and read-only inputs", () => {
    render(
      <>
        <Input aria-label="Disabled" disabled />
        <Input aria-label="Read only" readOnly defaultValue="fixed" />
      </>,
    );
    const disabled = screen.getByRole<HTMLInputElement>("textbox", { name: "Disabled" });
    const readOnly = screen.getByRole<HTMLInputElement>("textbox", { name: "Read only" });
    expect(disabled.disabled).toBe(true);
    expect(disabled.hasAttribute("data-disabled")).toBe(true);
    expect(readOnly.readOnly).toBe(true);
    expect(readOnly.hasAttribute("data-readonly")).toBe(true);
  });

  it("has no accessibility violations with a label and an error message", async () => {
    const { container } = render(
      <div>
        <label htmlFor="email">Email</label>
        <Input id="email" invalid aria-describedby="email-error" />
        <p id="email-error">Enter a valid email address.</p>
      </div>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("is reachable and focusable with the keyboard", () => {
    render(<Input aria-label="Email" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    input.focus();
    expect(document.activeElement).toBe(input);
  });
});
