import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./dialog.js";

const demo = (props: Partial<React.ComponentProps<typeof Dialog.Root>> = {}) => (
  <Dialog.Root {...props}>
    <Dialog.Trigger>Open dialog</Dialog.Trigger>
    <Dialog.Content>
      <Dialog.Title>Delete project</Dialog.Title>
      <Dialog.Description>This action cannot be undone.</Dialog.Description>
      <Dialog.Close>Cancel</Dialog.Close>
    </Dialog.Content>
  </Dialog.Root>
);

describe("Dialog", () => {
  it("renders closed and opens from its trigger", () => {
    render(demo());
    const trigger = screen.getByRole("button", { name: "Open dialog" });
    expect(trigger.classList.contains("pumba-dialog-trigger")).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).not.toBeNull();
  });

  it("labels the dialog with its title and description and keeps their classes", () => {
    render(demo({ defaultOpen: true }));
    const dialog = screen.getByRole("dialog");
    const title = screen.getByText("Delete project");
    const description = screen.getByText("This action cannot be undone.");
    expect(dialog.classList.contains("pumba-dialog")).toBe(true);
    expect(title.classList.contains("pumba-dialog-title")).toBe(true);
    expect(description.classList.contains("pumba-dialog-description")).toBe(true);
    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
    expect(dialog.getAttribute("aria-describedby")).toBe(description.id);
    expect(document.querySelector(".pumba-dialog-backdrop")).not.toBeNull();
  });

  it("appends the consumer className to every part", () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Trigger className="trigger">Open</Dialog.Trigger>
        <Dialog.Content className="content">
          <Dialog.Title className="title">Title</Dialog.Title>
          <Dialog.Description className="description">Description</Dialog.Description>
          <Dialog.Close className="close">Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>,
    );
    expect(screen.getByText("Open").classList.contains("trigger")).toBe(true);
    expect(screen.getByRole("dialog").classList.contains("content")).toBe(true);
    expect(screen.getByText("Title").classList.contains("title")).toBe(true);
    expect(screen.getByText("Description").classList.contains("description")).toBe(true);
    expect(screen.getByRole("button", { name: "Close" }).classList.contains("close")).toBe(true);
  });

  it("forwards the ref of every part", () => {
    const trigger = createRef<HTMLButtonElement>();
    const content = createRef<HTMLDivElement>();
    const title = createRef<HTMLHeadingElement>();
    const description = createRef<HTMLParagraphElement>();
    const close = createRef<HTMLButtonElement>();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Trigger ref={trigger}>Open</Dialog.Trigger>
        <Dialog.Content ref={content}>
          <Dialog.Title ref={title}>Title</Dialog.Title>
          <Dialog.Description ref={description}>Description</Dialog.Description>
          <Dialog.Close ref={close}>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>,
    );
    expect(trigger.current).toBe(screen.getByText("Open"));
    expect(content.current).toBe(screen.getByRole("dialog"));
    expect(title.current).toBe(screen.getByText("Title"));
    expect(description.current).toBe(screen.getByText("Description"));
    expect(close.current).toBe(screen.getByRole("button", { name: "Close" }));
  });

  it("keeps its class and ref with render={<a />}", () => {
    let node: HTMLElement | null = null;
    render(
      <Dialog.Root>
        <Dialog.Trigger
          ref={(element) => {
            node = element;
          }}
          nativeButton={false}
          render={<a href="#open" />}
        >
          Open
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Title</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>,
    );
    const link = screen.getByRole("button", { name: "Open" });
    expect(link.tagName).toBe("A");
    expect(link.classList.contains("pumba-dialog-trigger")).toBe(true);
    expect(node).toBe(link);
  });

  it("renders the content with render={<section />}", () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content render={<section />}>
          <Dialog.Title>Title</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.tagName).toBe("SECTION");
    expect(dialog.classList.contains("pumba-dialog")).toBe(true);
  });

  it("is uncontrolled with defaultOpen and closes with Dialog.Close", async () => {
    render(demo({ defaultOpen: true }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("is controlled with open and onOpenChange", async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(true);
      return demo({
        open,
        onOpenChange: (value) => {
          onOpenChange(value);
          setOpen(value);
        },
      });
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("stays open when controlled and the consumer does not update open", () => {
    render(demo({ open: true, onOpenChange: () => {} }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("dialog")).not.toBeNull();
  });

  it("renders into the container given by the consumer", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content container={container}>
          <Dialog.Title>Title</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>,
    );
    expect(container.contains(screen.getByRole("dialog"))).toBe(true);
    container.remove();
  });

  it("has no accessibility violations while open", async () => {
    render(demo({ defaultOpen: true }));
    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
