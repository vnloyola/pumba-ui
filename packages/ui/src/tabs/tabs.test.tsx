import { fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "./tabs.js";

const basic = (props: Partial<React.ComponentProps<typeof Tabs.Root>> = {}) => (
  <Tabs.Root defaultValue="account" {...props}>
    <Tabs.List aria-label="Settings">
      <Tabs.Tab value="account">Account</Tabs.Tab>
      <Tabs.Tab value="password">Password</Tabs.Tab>
      <Tabs.Tab value="alerts" disabled>
        Alerts
      </Tabs.Tab>
      <Tabs.Tab value="billing">Billing</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="account">Account panel</Tabs.Panel>
    <Tabs.Panel value="password">Password panel</Tabs.Panel>
    <Tabs.Panel value="alerts">Alerts panel</Tabs.Panel>
    <Tabs.Panel value="billing">Billing panel</Tabs.Panel>
  </Tabs.Root>
);

const tab = (name: string) => screen.getByRole("tab", { name });

describe("Tabs", () => {
  it("renders the tablist, tabs and the selected panel with their classes", () => {
    render(basic());
    expect(screen.getByRole("tablist").classList.contains("pumba-tabs-list")).toBe(true);
    expect(tab("Account").classList.contains("pumba-tabs-tab")).toBe(true);
    expect(tab("Account").getAttribute("aria-selected")).toBe("true");
    expect(tab("Password").getAttribute("aria-selected")).toBe("false");
    const panel = screen.getByRole("tabpanel");
    expect(panel.classList.contains("pumba-tabs-panel")).toBe(true);
    expect(panel.textContent).toBe("Account panel");
    expect(panel.closest(".pumba-tabs")).not.toBeNull();
  });

  it("appends the consumer className to every part", () => {
    render(
      <Tabs.Root className="root" defaultValue="a">
        <Tabs.List className="list" aria-label="Demo">
          <Tabs.Tab className="tab" value="a">
            A
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel className="panel" value="a">
          Panel
        </Tabs.Panel>
      </Tabs.Root>,
    );
    expect(document.querySelector(".pumba-tabs.root")).not.toBeNull();
    expect(screen.getByRole("tablist").classList.contains("list")).toBe(true);
    expect(tab("A").classList.contains("tab")).toBe(true);
    expect(screen.getByRole("tabpanel").classList.contains("panel")).toBe(true);
  });

  it("forwards the ref of every part", () => {
    const root = createRef<HTMLDivElement>();
    const list = createRef<HTMLDivElement>();
    const item = createRef<HTMLButtonElement>();
    const panel = createRef<HTMLDivElement>();
    render(
      <Tabs.Root ref={root} defaultValue="a">
        <Tabs.List ref={list} aria-label="Demo">
          <Tabs.Tab ref={item} value="a">
            A
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel ref={panel} value="a">
          Panel
        </Tabs.Panel>
      </Tabs.Root>,
    );
    expect(root.current?.classList.contains("pumba-tabs")).toBe(true);
    expect(list.current).toBe(screen.getByRole("tablist"));
    expect(item.current).toBe(tab("A"));
    expect(panel.current).toBe(screen.getByRole("tabpanel"));
  });

  it("keeps the class and ref of the tab with render={<a />}", () => {
    let node: HTMLElement | null = null;
    render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="Demo">
          <Tabs.Tab
            value="a"
            ref={(element) => {
              node = element;
            }}
            render={<a href="#a" />}
          >
            A
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">Panel</Tabs.Panel>
      </Tabs.Root>,
    );
    const link = tab("A");
    expect(link.tagName).toBe("A");
    expect(link.classList.contains("pumba-tabs-tab")).toBe(true);
    expect(node).toBe(link);
  });

  it("keeps the class and ref of the list, panel and root with render={<a />}", () => {
    const root = createRef<HTMLDivElement>();
    render(
      <Tabs.Root ref={root} defaultValue="a" render={<section />}>
        <Tabs.List aria-label="Demo" render={<section />}>
          <Tabs.Tab value="a">A</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a" render={<section />}>
          Panel
        </Tabs.Panel>
      </Tabs.Root>,
    );
    expect(root.current?.tagName).toBe("SECTION");
    expect(root.current?.classList.contains("pumba-tabs")).toBe(true);
    expect(screen.getByRole("tablist").tagName).toBe("SECTION");
    expect(screen.getByRole("tabpanel").tagName).toBe("SECTION");
  });

  it("is uncontrolled with defaultValue and reports changes", () => {
    const onValueChange = vi.fn();
    render(basic({ defaultValue: "password", onValueChange }));
    expect(tab("Password").getAttribute("aria-selected")).toBe("true");
    fireEvent.click(tab("Billing"));
    expect(onValueChange).toHaveBeenCalledWith("billing");
    expect(tab("Billing").getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("Billing panel");
  });

  it("is controlled with value and onValueChange", () => {
    function Controlled() {
      const [value, setValue] = useState("account");
      return (
        <>
          {basic({ defaultValue: undefined, value, onValueChange: setValue })}
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    fireEvent.click(tab("Password"));
    expect(screen.getByRole("status").textContent).toBe("password");
    expect(tab("Password").getAttribute("aria-selected")).toBe("true");
  });

  it("does not select a disabled tab", () => {
    const onValueChange = vi.fn();
    render(basic({ onValueChange }));
    fireEvent.click(tab("Alerts"));
    expect(tab("Alerts").hasAttribute("data-disabled")).toBe(true);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(tab("Account").getAttribute("aria-selected")).toBe("true");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(basic());
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
