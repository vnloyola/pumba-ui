import "./button.stories.css";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "../card/index.js";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  SearchIcon,
  ShareIcon,
} from "../icons.js";
import { Button } from "./button.js";

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "Save changes" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "destructive"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    iconOnly: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="button-story-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

const variants = ["primary", "secondary", "ghost", "destructive"] as const;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="button-story-row">
      <Button {...args} variant="primary">
        Run session
      </Button>
      <Button {...args} variant="secondary">
        Open PR
      </Button>
      <Button {...args} variant="ghost">
        Archive
      </Button>
      <Button {...args} variant="destructive">
        Delete
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="button-story-row">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const Icons: Story = {
  render: (args) => (
    <div className="button-story-row">
      <Button {...args}>
        <CheckIcon aria-hidden="true" />
        Approve plan
      </Button>
      <Button {...args} variant="secondary">
        Options
        <ChevronDownIcon aria-hidden="true" />
      </Button>
      <Button {...args} variant="secondary" iconOnly aria-label="Search">
        <SearchIcon aria-hidden="true" />
      </Button>
      <Button {...args} variant="ghost" iconOnly aria-label="Close">
        <CloseIcon aria-hidden="true" />
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="button-story-grid">
      {variants.map((variant) => (
        <div key={variant} className="button-story-row">
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

export const AsLink: Story = {
  render: (args) => (
    <Button {...args} variant="secondary" render={<a href="#pull-request" />}>
      Open pull request
      <ArrowUpRightIcon aria-hidden="true" />
    </Button>
  ),
};

export const InASession: Story = {
  render: () => (
    <Card.Root className="button-story-narrow">
      <Card.Header className="button-story-toolbar">
        <div>
          <h3 className="button-story-title">Fix flaky login test</h3>
          <p className="button-story-text">acme/web · finished 14 min ago</p>
        </div>
        <Button size="sm" variant="ghost" iconOnly aria-label="Share session">
          <ShareIcon aria-hidden="true" />
        </Button>
      </Card.Header>
      <Card.Footer>
        <Button size="sm">Run again</Button>
        <Button size="sm" variant="secondary">
          Open PR
          <ArrowUpRightIcon aria-hidden="true" />
        </Button>
        <Button size="sm" variant="ghost">
          Archive
        </Button>
      </Card.Footer>
    </Card.Root>
  ),
};
