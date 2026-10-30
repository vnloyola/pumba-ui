import "./dialog.stories.css";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../button/index.js";
import { CloseIcon } from "../icons.js";
import { Input } from "../input/index.js";
import { Dialog } from "./dialog.js";

const meta = {
  title: "Components/Dialog",
  component: Dialog.Root,
  decorators: [
    (Story) => (
      <div className="dialog-story-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dialog.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

const openInFrame = { docs: { story: { inline: false, height: "32rem" } } };

function ConfirmDelete({ container }: { container?: HTMLElement | null }) {
  return (
    <Dialog.Content container={container}>
      <Dialog.Title>Delete this project?</Dialog.Title>
      <Dialog.Description>
        All files, comments and members of "Website redesign" will be removed. This action cannot be
        undone.
      </Dialog.Description>
      <div className="dialog-story-actions">
        <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
        <Dialog.Close render={<Button />}>Delete project</Dialog.Close>
      </div>
    </Dialog.Content>
  );
}

export const Default: Story = {
  render: (args) => (
    <Dialog.Root {...args}>
      <Dialog.Trigger render={<Button />}>Delete project</Dialog.Trigger>
      <ConfirmDelete />
    </Dialog.Root>
  ),
};

export const OpenByDefault: Story = {
  args: { defaultOpen: true },
  parameters: openInFrame,
  render: (args) => (
    <Dialog.Root {...args}>
      <Dialog.Trigger render={<Button />}>Delete project</Dialog.Trigger>
      <ConfirmDelete />
    </Dialog.Root>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="dialog-story-row">
        <Button onClick={() => setOpen(true)}>Open from outside</Button>
        <p className="dialog-story-text">The dialog is {open ? "open" : "closed"}.</p>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <ConfirmDelete />
        </Dialog.Root>
      </div>
    );
  },
};

function InviteForm() {
  const id = useId();
  return (
    <Dialog.Content>
      <div className="dialog-story-header">
        <div className="dialog-story-stack">
          <Dialog.Title>Invite a teammate</Dialog.Title>
          <Dialog.Description>
            They will get an email with a link to join your workspace.
          </Dialog.Description>
        </div>
        <Dialog.Close render={<Button variant="ghost" iconOnly aria-label="Close" />}>
          <CloseIcon aria-hidden="true" />
        </Dialog.Close>
      </div>
      <form className="dialog-story-stack" onSubmit={(event) => event.preventDefault()}>
        <div className="dialog-story-field">
          <label className="dialog-story-label" htmlFor={id}>
            Email
          </label>
          <Input id={id} type="email" placeholder="ana@example.com" autoComplete="email" />
        </div>
        <div className="dialog-story-actions">
          <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
          <Button type="submit">Send invitation</Button>
        </div>
      </form>
    </Dialog.Content>
  );
}

export const WithForm: Story = {
  render: (args) => (
    <Dialog.Root {...args}>
      <Dialog.Trigger render={<Button variant="secondary" />}>Invite teammate</Dialog.Trigger>
      <InviteForm />
    </Dialog.Root>
  ),
};

const terms = [
  "By using the service you agree to these terms. If you do not agree, do not use the service.",
  "You are responsible for the content you upload and for keeping your credentials safe.",
  "We may update these terms from time to time and will notify you of material changes.",
  "The service is provided as is, without warranties of any kind, to the extent the law allows.",
  "You can cancel your account at any time from the settings page. Cancelling removes your data after thirty days.",
  "We process personal data as described in the privacy policy, which forms part of these terms.",
  "Disputes are handled in the courts of the country where the service operator is established.",
  "If a clause is found unenforceable, the rest of the terms stay in force.",
];

export const LongContent: Story = {
  args: { defaultOpen: true },
  parameters: openInFrame,
  render: (args) => (
    <Dialog.Root {...args}>
      <Dialog.Trigger render={<Button variant="secondary" />}>Read the terms</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Terms of service</Dialog.Title>
        <Dialog.Description>Read them carefully before you continue.</Dialog.Description>
        {[...terms, ...terms].map((paragraph, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static repeated sample text
          <p key={index} className="dialog-story-text">
            {paragraph}
          </p>
        ))}
        <div className="dialog-story-actions">
          <Dialog.Close render={<Button />}>I agree</Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  ),
};

export const OpenDark: Story = {
  parameters: openInFrame,
  render: () => {
    const [container, setContainer] = useState<HTMLElement | null>(null);
    return (
      <div className="dialog-story-dark" data-theme="dark" ref={setContainer}>
        <Dialog.Root defaultOpen>
          <Dialog.Trigger render={<Button />}>Delete project</Dialog.Trigger>
          <ConfirmDelete container={container} />
        </Dialog.Root>
      </div>
    );
  },
};

export const KeyboardNavigation: Story = {
  render: (args) => (
    <Dialog.Root {...args}>
      <Dialog.Trigger render={<Button />}>Delete project</Dialog.Trigger>
      <ConfirmDelete />
    </Dialog.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Delete project" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const dialog = await within(document.body).findByRole("dialog");
    const cancel = within(dialog).getByRole("button", { name: "Cancel" });
    const confirm = within(dialog).getByRole("button", { name: "Delete project" });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect(dialog.contains(document.activeElement)).toBe(true);
    await expect([cancel, confirm]).toContain(document.activeElement);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(document.body).queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};
