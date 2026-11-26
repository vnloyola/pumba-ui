import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button/index.js";
import { Dialog } from "./index.js";

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

  it("keeps a stable content callback ref attached until close and runs its cleanup", async () => {
    const events: string[] = [];
    const contentRef = (node: HTMLDivElement | null) => {
      if (!node) {
        events.push("null");
        return;
      }
      events.push("attach");
      return () => {
        events.push("cleanup");
      };
    };
    const dialogWithTitle = (title: string) => (
      <Dialog.Root defaultOpen>
        <Dialog.Content ref={contentRef}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    );
    const { rerender } = render(dialogWithTitle("Title"));
    const dialog = screen.getByRole("dialog");
    rerender(dialogWithTitle("Updated title"));
    events.push("before-close");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(dialog.isConnected).toBe(false));
    expect(events).toEqual(["attach", "before-close", "cleanup"]);
  });

  it("renders an element nested in the trigger instead of a second button", () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger>
          <Button variant="secondary">Open dialog</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Title</Dialog.Title>
          <Dialog.Close>
            <Button>Done</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>,
    );
    const trigger = screen.getByRole("button", { name: "Open dialog" });
    expect(trigger.querySelector("button")).toBeNull();
    expect(trigger.classList.contains("pumba-dialog-trigger")).toBe(true);
    expect(trigger.classList.contains("pumba-button")).toBe(true);
    expect(trigger.getAttribute("data-variant")).toBe("secondary");
    fireEvent.click(trigger);
    const done = screen.getByRole("button", { name: "Done" });
    expect(done.querySelector("button")).toBeNull();
    expect(done.classList.contains("pumba-dialog-close")).toBe(true);
    expect(done.classList.contains("pumba-button")).toBe(true);
  });

  it("closes from a nested close element", async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Title</Dialog.Title>
          <Dialog.Close>
            <Button>Done</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
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

  it("moves the initial focus to the first visible control, skipping hidden inputs", async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Title</Dialog.Title>
          <input type="hidden" name="token" value="abc" />
          <input aria-label="Name" />
        </Dialog.Content>
      </Dialog.Root>,
    );
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText("Name")));
  });

  it("focuses the popup instead of a text input when opened by touch", async () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger>Open form</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Details</Dialog.Title>
          <input aria-label="Name" />
        </Dialog.Content>
      </Dialog.Root>,
    );
    const trigger = screen.getByRole("button", { name: "Open form" });
    fireEvent.pointerDown(trigger, { pointerType: "touch" });
    fireEvent.click(trigger, { detail: 1 });
    const dialog = screen.getByRole("dialog");

    await waitFor(() => expect(document.activeElement).toBe(dialog));
  });

  it("skips controls disabled by a fieldset even if they are outside the scroll bounds", async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Details</Dialog.Title>
          <fieldset disabled>
            <input
              aria-label="Disabled name"
              ref={(element) => {
                if (element) element.getBoundingClientRect = () => new DOMRect(0, 500, 100, 32);
              }}
            />
          </fieldset>
          <input aria-label="Enabled name" />
        </Dialog.Content>
      </Dialog.Root>,
    );

    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText("Enabled name")));
  });

  it("does not measure or try to focus controls in a display-none ancestor", async () => {
    const measure = vi.fn(() => new DOMRect());
    const focus = vi.fn();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Details</Dialog.Title>
          <div style={{ display: "none" }}>
            <input
              aria-label="Hidden name"
              ref={(element) => {
                if (element) {
                  element.getBoundingClientRect = measure;
                  element.focus = focus;
                }
              }}
            />
          </div>
          <input aria-label="Visible name" />
        </Dialog.Content>
      </Dialog.Root>,
    );

    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText("Visible name")));
    expect(measure).not.toHaveBeenCalled();
    expect(focus).not.toHaveBeenCalled();
  });

  it("focuses the scrollable dialog body instead of an offscreen action", async () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger>Read the terms</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Terms of service</Dialog.Title>
          <p>Read these terms before continuing.</p>
          <Dialog.Close
            ref={(element) => {
              if (element) element.getBoundingClientRect = () => new DOMRect(0, 500, 100, 32);
            }}
          >
            I agree
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Read the terms" }));
    const dialog = screen.getByRole("dialog");
    const body = dialog.querySelector<HTMLElement>(".pumba-dialog-body");
    if (!body) throw new Error("Dialog body not found");
    body.getBoundingClientRect = () => new DOMRect(0, 0, 300, 400);

    await waitFor(() => expect(document.activeElement).toBe(body));
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
