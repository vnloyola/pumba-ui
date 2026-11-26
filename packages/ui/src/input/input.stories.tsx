import "./input.stories.css";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ComponentProps, useId } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "../button/index.js";
import { Card } from "../card/index.js";
import { ArrowRightIcon, SearchIcon, WarningIcon } from "../icons.js";
import { Input } from "./input.js";

type LabeledInputProps = ComponentProps<typeof Input> & {
  label: string;
  hint?: string;
  error?: string;
};

function LabeledInput({ label, hint, error, ...props }: LabeledInputProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;
  return (
    <div className="input-story-field">
      <label className="input-story-label" htmlFor={id}>
        {label}
      </label>
      <Input
        id={id}
        invalid={Boolean(error)}
        aria-describedby={message ? messageId : undefined}
        {...props}
      />
      {error ? (
        <p className="input-story-error" id={messageId}>
          <WarningIcon aria-hidden="true" />
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p className="input-story-hint" id={messageId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const meta = {
  title: "Components/Input",
  component: Input,
  args: { "aria-label": "Search sessions", placeholder: "Search" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    invalid: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="input-story-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="input-story-stack">
      <Input {...args} size="sm" aria-label="Small" placeholder="Small" />
      <Input {...args} size="md" aria-label="Medium" placeholder="Medium" />
      <Input {...args} size="lg" aria-label="Large" placeholder="Large" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="input-story-stack">
      <LabeledInput
        label="Environment name"
        placeholder="staging"
        hint="Letters, numbers and dashes."
      />
      <LabeledInput
        label="API key"
        defaultValue="sk_live_abc"
        error="This key was revoked. Generate a new one."
      />
      <LabeledInput label="Workspace" defaultValue="acme" disabled />
      <LabeledInput label="Region" defaultValue="us-east-1" readOnly />
    </div>
  ),
};

export const Composed: Story = {
  render: (args) => (
    <div className="input-story-stack">
      <form className="input-story-row" onSubmit={(event) => event.preventDefault()}>
        <Input {...args} type="search" aria-label="Search sessions" placeholder="Search sessions" />
        <Button type="submit" iconOnly aria-label="Search">
          <SearchIcon aria-hidden="true" />
        </Button>
      </form>
      <form className="input-story-row" onSubmit={(event) => event.preventDefault()}>
        <Input {...args} type="url" aria-label="Repository URL" placeholder="github.com/acme/web" />
        <Button type="submit">
          Connect
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      </form>
    </div>
  ),
};

export const InAForm: Story = {
  render: () => (
    <Card.Root render={<form onSubmit={(event) => event.preventDefault()} />}>
      <Card.Header>
        <h3 className="input-story-title">Create an environment</h3>
      </Card.Header>
      <Card.Content className="input-story-stack">
        <LabeledInput label="Full name" placeholder="Ana Torres" autoComplete="name" />
        <LabeledInput
          label="Email"
          type="email"
          placeholder="ana@example.com"
          autoComplete="email"
        />
        <LabeledInput
          label="Password"
          type="password"
          hint="Use at least 8 characters."
          autoComplete="new-password"
        />
      </Card.Content>
      <Card.Footer>
        <Button type="submit">Create account</Button>
        <Button variant="ghost" type="button">
          Cancel
        </Button>
      </Card.Footer>
    </Card.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByRole("textbox", { name: "Email" });
    const createAccount = canvas.getByRole("button", { name: "Create account" });
    const document = canvasElement.ownerDocument;
    const url = document.URL;
    const form = email.closest("form");
    const invalid = fn();
    const submit = fn((event: Event) => event.defaultPrevented);
    const listeners = new AbortController();
    email.addEventListener("invalid", invalid, { signal: listeners.signal });
    document.addEventListener(
      "submit",
      (event) => {
        if (event.target === form) submit(event);
      },
      { signal: listeners.signal },
    );

    try {
      await userEvent.type(email, "not-an-email");
      await userEvent.click(createAccount);
      await expect(invalid).toHaveBeenCalledTimes(1);
      await expect(email).toHaveFocus();
      await expect(submit).not.toHaveBeenCalled();

      await userEvent.clear(email);
      await userEvent.type(email, "test@example.com");
      await userEvent.click(createAccount);
      await expect(submit).toHaveBeenCalledTimes(1);
      await expect(submit).toHaveReturnedWith(true);
      await expect(document.URL).toBe(url);
      await expect(email).toHaveValue("test@example.com");
    } finally {
      listeners.abort();
      form?.reset();
      canvasElement.tabIndex = -1;
      canvasElement.focus({ preventScroll: true });
      canvasElement.removeAttribute("tabindex");
    }
  },
};

export const ForcedStates: Story = {
  render: (args) => (
    <div className="input-story-grid">
      <Input {...args} aria-label="Default" placeholder="Default" />
      <Input {...args} aria-label="Hovered" placeholder="Hovered" data-hovered />
      <Input {...args} aria-label="Focus visible" placeholder="Focus visible" data-focus-visible />
      <Input {...args} aria-label="Filled" defaultValue="With a value" />
      <Input {...args} aria-label="Read only" defaultValue="Read only" readOnly />
      <Input {...args} aria-label="Disabled" defaultValue="Disabled" disabled />
      <Input {...args} aria-label="Invalid" defaultValue="Invalid" invalid />
    </div>
  ),
};
