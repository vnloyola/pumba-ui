import "./card.stories.css";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../badge/index.js";
import { Button } from "../button/index.js";
import {
  ArrowUpRightIcon,
  CartIcon,
  CheckIcon,
  ClockIcon,
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

const porsche = "/assets/porsche.jpg";

export const Default: Story = {
  render: (args) => (
    <Card.Root {...args} className="card-story-narrow card-story-issue">
      <Card.Header className="card-story-row">
        <span className="card-story-id">PUM-142</span>
        <span className="card-story-avatar" role="img" aria-label="Assigned to Ana Muñoz">
          AM
        </span>
      </Card.Header>
      <Card.Content className="card-story-issue-body">
        <h3 className="card-story-title">Refresh the color palette</h3>
        <p className="card-story-text">
          Move to warm neutrals and a single tan accent, keeping every pair at WCAG AA.
        </p>
      </Card.Content>
      <Card.Footer>
        <span className="card-story-status">
          <span className="card-story-status-ring" aria-hidden="true" />
          In progress
        </span>
        <Badge size="sm">Design</Badge>
        <span className="card-story-due">
          <ClockIcon aria-hidden="true" size={14} />
          Nov 28
        </span>
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
          <DollarIcon aria-hidden="true" size={16} strokeWidth={1.75} />
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

const plan = ["Unlimited projects", "Shared reports", "Priority support"];

export const Pricing: Story = {
  render: (args) => (
    <Card.Root {...args} className="card-story-narrow">
      <Card.Header className="card-story-row">
        <h3 className="card-story-title">Team</h3>
        <Badge size="sm" variant="accent">
          Popular
        </Badge>
      </Card.Header>
      <Card.Content className="card-story-issue-body">
        <p className="card-story-value">
          $12<span className="card-story-text"> / seat / month</span>
        </p>
        <ul className="card-story-list">
          {plan.map((feature) => (
            <li key={feature}>
              <CheckIcon aria-hidden="true" size={16} strokeWidth={1.75} />
              {feature}
            </li>
          ))}
        </ul>
      </Card.Content>
      <Card.Footer>
        <Button className="card-story-grow">Start free trial</Button>
      </Card.Footer>
    </Card.Root>
  ),
};

export const Profile: Story = {
  render: (args) => (
    <Card.Root {...args} className="card-story-narrow">
      <Card.Header className="card-story-person">
        <span className="card-story-avatar card-story-avatar-lg" aria-hidden="true">
          AM
        </span>
        <div>
          <h3 className="card-story-title">Ana Muñoz</h3>
          <p className="card-story-text">Product designer</p>
        </div>
      </Card.Header>
      <Card.Footer>
        <Button size="sm" variant="secondary">
          Message
        </Button>
        <Button size="sm" variant="ghost">
          View profile
        </Button>
      </Card.Footer>
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
              <Icon aria-hidden="true" size={16} strokeWidth={1.75} />
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
    <Card.Root {...args} className="card-story-narrow" render={<a href="#whats-new" />}>
      <Card.Header className="card-story-row">
        <span className="card-story-icon">
          <SparklesIcon aria-hidden="true" size={16} strokeWidth={1.75} />
        </span>
        <span className="card-story-icon">
          <ArrowUpRightIcon aria-hidden="true" size={16} strokeWidth={1.75} />
        </span>
      </Card.Header>
      <Card.Content>
        <h3 className="card-story-title">What's new</h3>
        <p className="card-story-text">See everything we shipped this month.</p>
      </Card.Content>
    </Card.Root>
  ),
};

const links = [
  { title: "Getting started", text: "Install the packages and render a first component." },
  { title: "Tokens", text: "Colors, spacing and type as CSS variables." },
  { title: "Theming", text: "Light and dark modes with one attribute." },
];

export const LinkStates: Story = {
  render: (args) => (
    <div className="card-story-grid">
      {links.map(({ title, text }, index) => (
        <Card.Root
          key={title}
          {...args}
          render={<a href={`#${title.toLowerCase().replace(" ", "-")}`} />}
          data-hovered={index === 1 ? "" : undefined}
          data-focus-visible={index === 2 ? "" : undefined}
        >
          <Card.Header className="card-story-row">
            <h3 className="card-story-title">{title}</h3>
            <span className="card-story-icon">
              <ArrowUpRightIcon aria-hidden="true" size={16} strokeWidth={1.75} />
            </span>
          </Card.Header>
          <Card.Content>
            <p className="card-story-text">{text}</p>
          </Card.Content>
        </Card.Root>
      ))}
    </div>
  ),
};

export const DefaultDark: Story = {
  render: (args, context) => (
    <div className="card-story-dark" data-theme="dark">
      {Default.render?.(args, context)}
    </div>
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

export const LinkStatesDark: Story = {
  render: (args, context) => (
    <div className="card-story-dark" data-theme="dark">
      {LinkStates.render?.(args, context)}
    </div>
  ),
};
