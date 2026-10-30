import "./input.stories.css";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ComponentProps, useId } from "react";
import { Button } from "../button/index.js";
import { Card } from "../card/index.js";
import { WarningIcon } from "../icons.js";
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
          <WarningIcon aria-hidden="true" size={14} />
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
  args: { "aria-label": "Email address", placeholder: "you@example.com" },
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

export const WithLabel: Story = {
  render: () => <LabeledInput label="Email" hint="We will only use it to send your receipts." />,
};

export const Invalid: Story = {
  render: () => (
    <LabeledInput
      label="Email"
      defaultValue="ana@example"
      error="Enter a valid email address, like ana@example.com."
    />
  ),
};

export const Disabled: Story = {
  render: () => <LabeledInput label="Workspace" defaultValue="Pumba" disabled />,
};

export const ReadOnly: Story = {
  render: () => <LabeledInput label="Invoice number" defaultValue="INV-2024-0042" readOnly />,
};

export const Hovered: Story = {
  render: (args) => <Input {...args} data-hovered />,
};

export const FocusVisible: Story = {
  render: (args) => <Input {...args} data-focus-visible />,
};

export const WithButton: Story = {
  render: (args) => (
    <form className="input-story-row" onSubmit={(event) => event.preventDefault()}>
      <Input {...args} type="email" aria-label="Email for the newsletter" />
      <Button type="submit">Subscribe</Button>
    </form>
  ),
};

export const InAForm: Story = {
  render: () => (
    <Card.Root>
      <Card.Header>
        <h3 className="input-story-title">Create your account</h3>
      </Card.Header>
      <Card.Content>
        <form className="input-story-stack" onSubmit={(event) => event.preventDefault()}>
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
        </form>
      </Card.Content>
      <Card.Footer>
        <Button>Create account</Button>
        <Button variant="ghost">Cancel</Button>
      </Card.Footer>
    </Card.Root>
  ),
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

export const ForcedStatesDark: Story = {
  render: (args, context) => (
    <div className="input-story-dark" data-theme="dark">
      {ForcedStates.render?.(args, context)}
    </div>
  ),
};

export const InAFormDark: Story = {
  render: (args, context) => (
    <div className="input-story-dark" data-theme="dark">
      <div className="input-story-narrow">{InAForm.render?.(args, context)}</div>
    </div>
  ),
};
