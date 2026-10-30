import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckIcon, ChevronDownIcon } from "../icons.js";
import { Button } from "./button.js";

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "Button" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    iconOnly: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = { args: { variant: "secondary" } };

export const Ghost: Story = { args: { variant: "ghost" } };

export const Small: Story = { args: { size: "sm" } };

export const Large: Story = { args: { size: "lg" } };

export const StartIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <CheckIcon aria-hidden="true" />
      Confirm
    </Button>
  ),
};

export const EndIcon: Story = {
  render: (args) => (
    <Button {...args}>
      Options
      <ChevronDownIcon aria-hidden="true" />
    </Button>
  ),
};

export const IconOnly: Story = {
  args: { iconOnly: true, "aria-label": "Confirm", children: <CheckIcon aria-hidden="true" /> },
};

export const Disabled: Story = { args: { disabled: true } };

export const Loading: Story = { args: { loading: true } };

export const Hovered: Story = {
  render: (args) => <Button {...args} data-hovered />,
};

export const Pressed: Story = {
  render: (args) => <Button {...args} data-pressed />,
};

export const FocusVisible: Story = {
  render: (args) => <Button {...args} data-focus-visible />,
};

const variants = ["primary", "secondary", "ghost"] as const;

export const ForcedStates: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--pumba-space-4)", padding: "var(--pumba-space-6)" }}>
      {variants.map((variant) => (
        <div key={variant} style={{ display: "flex", gap: "var(--pumba-space-4)" }}>
          <Button {...args} variant={variant}>
            Default
          </Button>
          <Button {...args} variant={variant} data-hovered>
            Hovered
          </Button>
          <Button {...args} variant={variant} data-pressed>
            Pressed
          </Button>
          <Button {...args} variant={variant} data-focus-visible>
            Focus visible
          </Button>
          <Button {...args} variant={variant} disabled>
            Disabled
          </Button>
          <Button {...args} variant={variant} loading>
            Loading
          </Button>
        </div>
      ))}
    </div>
  ),
};

export const ForcedStatesDark: Story = {
  ...ForcedStates,
  globals: { theme: "dark" },
};
