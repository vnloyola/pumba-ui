import "./card.stories.css";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button/index.js";
import {
  ArrowUpRightIcon,
  CartIcon,
  DollarIcon,
  HeartIcon,
  MapPinIcon,
  ShareIcon,
  SparklesIcon,
  StarIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UsersIcon,
} from "../icons.js";
import { Card } from "./card.js";

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

const porsche = "/assets/porsche.jpg";

export const Default: Story = {
  render: (args) => (
    <Card.Root {...args} className="card-story-narrow">
      <Card.Header>
        <span className="card-story-icon">
          <UsersIcon aria-hidden="true" />
        </span>
      </Card.Header>
      <Card.Content>
        <h3 className="card-story-title">Invite your team</h3>
        <p className="card-story-text">
          Add teammates to your workspace so everyone can follow the same reports and share comments
          in one place.
        </p>
      </Card.Content>
      <Card.Footer>
        <a className="card-story-link" href="#invite">
          Send invitations
          <ArrowUpRightIcon aria-hidden="true" />
        </a>
      </Card.Footer>
    </Card.Root>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: (args) => (
    <Card.Root {...args} className="card-story-narrow">
      <Card.Header className="card-story-row">
        <h3 className="card-story-title">Monthly revenue</h3>
        <span className="card-story-icon">
          <DollarIcon aria-hidden="true" />
        </span>
      </Card.Header>
      <Card.Content>
        <p className="card-story-value">$48,200</p>
        <p className="card-story-text">Compared with $43,000 last month.</p>
      </Card.Content>
      <Card.Footer>
        <Button size="sm" variant="secondary">
          View report
        </Button>
        <Button size="sm" variant="ghost">
          Dismiss
        </Button>
      </Card.Footer>
    </Card.Root>
  ),
};

export const Horizontal: Story = {
  render: (args) => (
    <Card.Root {...args} className="card-story-wide card-story-horizontal">
      <img
        className="card-story-thumb"
        src={porsche}
        alt="Green Porsche 911 parked on a lawn with a palm tree"
      />
      <div className="card-story-body">
        <Card.Header>
          <h3 className="card-story-title">Get the new Porsche 911 Classic</h3>
          <p className="card-story-text">
            Experience unmatched luxury and performance, where sleek design meets cutting-edge tech
            and pure driving thrill.
          </p>
        </Card.Header>
        <Card.Footer className="card-story-row">
          <div className="card-story-price">
            <p className="card-story-title">$36,799</p>
            <p className="card-story-text">11 available</p>
          </div>
          <Button>
            <CartIcon aria-hidden="true" />
            Buy now
          </Button>
        </Card.Footer>
      </div>
    </Card.Root>
  ),
};

export const WithImage: Story = {
  render: (args) => (
    <Card.Root {...args} className="card-story-narrow">
      <img
        className="card-story-cover"
        src={porsche}
        alt="Green Porsche 911 parked on a lawn with a palm tree"
      />
      <Card.Header className="card-story-row">
        <h3 className="card-story-title">Porsche 911 Classic</h3>
        <span className="card-story-meta">
          <StarIcon aria-hidden="true" size={16} />
          4.9
        </span>
      </Card.Header>
      <Card.Content>
        <p className="card-story-meta">
          <MapPinIcon aria-hidden="true" size={16} />
          Stuttgart, Germany
        </p>
      </Card.Content>
      <Card.Footer>
        <Button>Book a test drive</Button>
        <Button className="card-story-actions" variant="secondary" iconOnly aria-label="Save">
          <HeartIcon aria-hidden="true" />
        </Button>
        <Button variant="secondary" iconOnly aria-label="Share">
          <ShareIcon aria-hidden="true" />
        </Button>
      </Card.Footer>
    </Card.Root>
  ),
};

const metrics = [
  { label: "Revenue", value: "$48,200", change: "12.5%", trend: "up", icon: DollarIcon },
  { label: "Customers", value: "1,284", change: "4.1%", trend: "up", icon: UsersIcon },
  { label: "Refunds", value: "32", change: "2.3%", trend: "down", icon: SparklesIcon },
] as const;

export const InALayout: Story = {
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
                <TrendingUpIcon aria-hidden="true" size={14} />
              ) : (
                <TrendingDownIcon aria-hidden="true" size={14} />
              )}
              {change}
            </span>
            <span className="card-story-text">vs last month</span>
          </Card.Footer>
        </Card.Root>
      ))}
    </div>
  ),
};

export const AsLink: Story = {
  render: (args) => (
    <Card.Root
      {...args}
      className="card-story-narrow card-story-linkcard"
      render={<a href="#whats-new" />}
    >
      <Card.Header className="card-story-row">
        <span className="card-story-icon">
          <SparklesIcon aria-hidden="true" />
        </span>
        <ArrowUpRightIcon aria-hidden="true" />
      </Card.Header>
      <Card.Content>
        <h3 className="card-story-title">What's new</h3>
        <p className="card-story-text">See everything we shipped this month.</p>
      </Card.Content>
    </Card.Root>
  ),
};

export const HorizontalDark: Story = {
  render: (args, context) => (
    <div className="card-story-dark" data-theme="dark">
      {Horizontal.render?.(args, context)}
    </div>
  ),
};

export const InALayoutDark: Story = {
  render: (args, context) => (
    <div className="card-story-dark" data-theme="dark">
      {InALayout.render?.(args, context)}
    </div>
  ),
};
