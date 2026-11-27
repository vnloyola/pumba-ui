import "./badge.stories.css";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "../card/index.js";
import {
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  Half2Icon,
  MagicWandIcon,
  PlusCircledIcon,
} from "../icons.js";
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
        <CircleIcon aria-hidden="true" />
        Queued
      </Badge>
      <Badge {...args} variant="warning">
        <Half2Icon aria-hidden="true" />
        Running
      </Badge>
      <Badge {...args} variant="success">
        <CheckCircledIcon aria-hidden="true" />
        Finished
      </Badge>
      <Badge {...args} variant="error">
        <CrossCircledIcon aria-hidden="true" />
        Failed
      </Badge>
      <Badge {...args} variant="accent">
        <PlusCircledIcon aria-hidden="true" />
        New
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

const sessions = [
  { title: "Fix flaky login test", repo: "acme/web", variant: "success", label: "Finished" },
  { title: "Add rate limiting to /auth", repo: "acme/api", variant: "warning", label: "Running" },
  { title: "Migrate CI to pnpm", repo: "acme/infra", variant: "error", label: "Failed" },
] as const;

const sessionIcons = {
  Finished: CheckCircledIcon,
  Running: Half2Icon,
  Failed: CrossCircledIcon,
} as const;

export const InASessionList: Story = {
  render: (args) => (
    <Card.Root className="badge-story-narrow">
      <Card.Header className="badge-story-row">
        <h3 className="badge-story-title">Sessions</h3>
        <Badge {...args} variant="neutral" size="sm">
          {sessions.length}
        </Badge>
      </Card.Header>
      <Card.Content>
        <ul className="badge-story-list">
          {sessions.map(({ title, repo, variant, label }) => {
            const Icon = sessionIcons[label];
            return (
              <li key={title} className="badge-story-item">
                <div>
                  <p className="badge-story-title">{title}</p>
                  <p className="badge-story-text">{repo}</p>
                </div>
                <Badge {...args} variant={variant} size="sm">
                  <Icon aria-hidden="true" />
                  {label}
                </Badge>
              </li>
            );
          })}
        </ul>
      </Card.Content>
    </Card.Root>
  ),
};

export const AsLink: Story = {
  render: (args) => (
    <Badge {...args} variant="accent" render={<a href="#changelog" />}>
      <MagicWandIcon aria-hidden="true" />
      What's new
    </Badge>
  ),
};
