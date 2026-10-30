import "./badge.stories.css";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "../card/index.js";
import { CheckIcon, ClockIcon, CloseIcon, SparklesIcon, WarningIcon } from "../icons.js";
import { Badge } from "./badge.js";

const meta = {
  title: "Components/Badge",
  component: Badge,
  args: { children: "Badge" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["neutral", "accent", "success", "error", "warning"],
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
  decorators: [
    (Story) => (
      <div className="badge-story-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="badge-story-row">
      <Badge {...args} variant="neutral">
        Draft
      </Badge>
      <Badge {...args} variant="accent">
        New
      </Badge>
      <Badge {...args} variant="success">
        Paid
      </Badge>
      <Badge {...args} variant="error">
        Failed
      </Badge>
      <Badge {...args} variant="warning">
        Pending
      </Badge>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="badge-story-row">
      <Badge {...args} size="sm">
        Small
      </Badge>
      <Badge {...args} size="md">
        Medium
      </Badge>
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="badge-story-row">
      <Badge {...args} variant="neutral">
        <ClockIcon aria-hidden="true" />
        Scheduled
      </Badge>
      <Badge {...args} variant="accent">
        <SparklesIcon aria-hidden="true" />
        New
      </Badge>
      <Badge {...args} variant="success">
        <CheckIcon aria-hidden="true" />
        Paid
      </Badge>
      <Badge {...args} variant="error">
        <CloseIcon aria-hidden="true" />
        Failed
      </Badge>
      <Badge {...args} variant="warning">
        <WarningIcon aria-hidden="true" />
        Needs review
      </Badge>
    </div>
  ),
};

const orders = [
  { id: "#1042", customer: "Marta Rojas", variant: "success", label: "Paid", icon: CheckIcon },
  { id: "#1043", customer: "Diego Pérez", variant: "warning", label: "Pending", icon: ClockIcon },
  { id: "#1044", customer: "Lucía Soto", variant: "error", label: "Failed", icon: CloseIcon },
] as const;

export const InAList: Story = {
  render: (args) => (
    <Card.Root className="badge-story-narrow">
      <Card.Header>
        <h3 className="badge-story-title">Recent orders</h3>
      </Card.Header>
      <Card.Content>
        <ul className="badge-story-list">
          {orders.map(({ id, customer, variant, label, icon: Icon }) => (
            <li key={id} className="badge-story-item">
              <div>
                <p className="badge-story-title">{id}</p>
                <p className="badge-story-text">{customer}</p>
              </div>
              <Badge {...args} variant={variant} size="sm">
                <Icon aria-hidden="true" />
                {label}
              </Badge>
            </li>
          ))}
        </ul>
      </Card.Content>
    </Card.Root>
  ),
};

export const AsLink: Story = {
  render: (args) => (
    <Badge {...args} variant="accent" render={<a href="#changelog" />}>
      <SparklesIcon aria-hidden="true" />
      What's new
    </Badge>
  ),
};

export const VariantsDark: Story = {
  render: (args, context) => (
    <div className="badge-story-dark" data-theme="dark">
      {Variants.render?.(args, context)}
    </div>
  ),
};

export const WithIconsDark: Story = {
  render: (args, context) => (
    <div className="badge-story-dark" data-theme="dark">
      {WithIcons.render?.(args, context)}
    </div>
  ),
};
