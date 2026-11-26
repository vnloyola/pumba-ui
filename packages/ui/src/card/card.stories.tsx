import "./card.stories.css";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { Badge } from "../badge/index.js";
import {
  ArrowBottomRightIcon,
  ArrowUpRightIcon,
  ClockIcon,
  CommitIcon,
  CrossCircledIcon,
  LapTimerIcon,
  MagicWandIcon,
} from "../icons.js";
import { Card } from "./index.js";

const meta = {
  title: "Components/Card",
  component: Card.Root,
  decorators: [
    (Story) => (
      <div className="card-story-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

const sessions = [
  {
    id: "ses_4f2a",
    title: "Fix flaky login test",
    repo: "acme/web",
    status: "Finished",
    variant: "success",
    time: "14 min",
  },
  {
    id: "ses_9c1b",
    title: "Add rate limiting to /auth",
    repo: "acme/api",
    status: "Running",
    variant: "warning",
    time: "2 min",
  },
  {
    id: "ses_7d3e",
    title: "Migrate CI to pnpm",
    repo: "acme/infra",
    status: "Failed",
    variant: "error",
    time: "1 h",
  },
] as const;

type Session = (typeof sessions)[number];

function SessionCard({
  session,
  ...props
}: { session: Session } & ComponentProps<typeof Card.Root>) {
  return (
    <Card.Root {...props} className="card-story-narrow card-story-session">
      <Card.Header className="card-story-row">
        <span className="card-story-id">{session.id}</span>
        <Badge size="sm" variant={session.variant}>
          {session.status}
        </Badge>
      </Card.Header>
      <Card.Content className="card-story-session-body">
        <h3 className="card-story-title">{session.title}</h3>
        <p className="card-story-text">{session.repo} · opened a PR against main</p>
      </Card.Content>
      <Card.Footer>
        <span className="card-story-meta">
          <CommitIcon aria-hidden="true" />3 commits
        </span>
        <span className="card-story-due">
          <ClockIcon aria-hidden="true" />
          {session.time} ago
        </span>
      </Card.Footer>
    </Card.Root>
  );
}

export const Default: Story = {
  render: (args) => <SessionCard {...args} session={sessions[0]} />,
};

export const Sessions: Story = {
  render: (args) => (
    <div className="card-story-stack">
      {sessions.map((session) => (
        <SessionCard key={session.id} {...args} session={session} />
      ))}
    </div>
  ),
};

const metrics = [
  { label: "Sessions this week", value: "42", change: "+12.5%", trend: "up", icon: LapTimerIcon },
  { label: "PRs merged", value: "18", change: "+4.1%", trend: "up", icon: CommitIcon },
  { label: "Failed runs", value: "3", change: "-2.3%", trend: "down", icon: CrossCircledIcon },
] as const;

export const InAGrid: Story = {
  render: (args) => (
    <div className="card-story-grid">
      {metrics.map(({ label, value, change, trend, icon: Icon }) => (
        <Card.Root key={label} {...args}>
          <Card.Header className="card-story-row">
            <p className="card-story-text">{label}</p>
            <span className="card-story-icon">
              <Icon aria-hidden="true" />
            </span>
          </Card.Header>
          <Card.Content>
            <p className="card-story-value">{value}</p>
          </Card.Content>
          <Card.Footer>
            <span className="card-story-trend" data-trend={trend}>
              {trend === "up" ? (
                <ArrowUpRightIcon aria-hidden="true" />
              ) : (
                <ArrowBottomRightIcon aria-hidden="true" />
              )}
              {change}
            </span>
            <span className="card-story-text">vs last week</span>
          </Card.Footer>
        </Card.Root>
      ))}
    </div>
  ),
};

const links = [
  { title: "Connect a repo", text: "Give Devin access to your codebase." },
  { title: "Invite your team", text: "Share sessions and reviews." },
  { title: "Set up integrations", text: "Slack, Linear and CI hooks." },
];

export const Interactive: Story = {
  render: (args) => (
    <div className="card-story-grid">
      {links.map(({ title, text }, index) => (
        <Card.Root
          key={title}
          {...args}
          render={<a href={`#${title.toLowerCase().replaceAll(" ", "-")}`} />}
          data-hovered={index === 1 ? "" : undefined}
          data-focus-visible={index === 2 ? "" : undefined}
        >
          <Card.Header className="card-story-row">
            <span className="card-story-icon">
              <MagicWandIcon aria-hidden="true" />
            </span>
            <span className="card-story-icon">
              <ArrowUpRightIcon aria-hidden="true" />
            </span>
          </Card.Header>
          <Card.Content>
            <h3 className="card-story-title">{title}</h3>
            <p className="card-story-text">{text}</p>
          </Card.Content>
        </Card.Root>
      ))}
    </div>
  ),
};
