import "./button.stories.css";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "../card/index.js";
import {
  ArrowUpRightIcon,
  CartIcon,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  HeartIcon,
  ShareIcon,
} from "../icons.js";
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

const variants = ["primary", "secondary", "ghost"] as const;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="button-story-row">
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
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

export const WithIcons: Story = {
  render: (args) => (
    <div className="button-story-row">
      <Button {...args}>
        <CartIcon aria-hidden="true" />
        Add to cart
      </Button>
      <Button {...args} variant="secondary">
        Options
        <ChevronDownIcon aria-hidden="true" />
      </Button>
      <Button {...args} variant="ghost">
        <CheckIcon aria-hidden="true" />
        Mark as done
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  render: (args) => (
    <div className="button-story-row">
      <Button {...args} iconOnly aria-label="Save to favorites">
        <HeartIcon aria-hidden="true" />
      </Button>
      <Button {...args} variant="secondary" iconOnly aria-label="Share">
        <ShareIcon aria-hidden="true" />
      </Button>
      <Button {...args} variant="ghost" iconOnly aria-label="Close">
        <CloseIcon aria-hidden="true" />
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="button-story-row">
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant} disabled>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Loading: Story = {
  render: (args) => (
    <div className="button-story-row">
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant} loading>
          Saving
        </Button>
      ))}
    </div>
  ),
};

export const AsLink: Story = {
  render: (args) => (
    <Button {...args} variant="secondary" render={<a href="#docs" />}>
      Read the docs
      <ArrowUpRightIcon aria-hidden="true" />
    </Button>
  ),
};

export const InACard: Story = {
  render: () => (
    <Card.Root className="button-story-narrow">
      <Card.Header>
        <h3 className="button-story-title">Publish your site</h3>
      </Card.Header>
      <Card.Content>
        <p className="button-story-text">
          Your changes will be visible to everyone with the link. You can unpublish at any time.
        </p>
      </Card.Content>
      <Card.Footer>
        <Button>Publish</Button>
        <Button variant="ghost">Cancel</Button>
      </Card.Footer>
    </Card.Root>
  ),
};

export const Hovered: Story = {
  render: (args) => <Button {...args} data-hovered />,
};

export const Pressed: Story = {
  render: (args) => <Button {...args} data-pressed />,
};

export const FocusVisible: Story = {
  render: (args) => <Button {...args} data-focus-visible />,
};

export const ForcedStates: Story = {
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

export const ForcedStatesDark: Story = {
  render: (args, context) => (
    <div className="button-story-dark" data-theme="dark">
      {ForcedStates.render?.(args, context)}
    </div>
  ),
};

export const SizesDark: Story = {
  render: (args, context) => (
    <div className="button-story-dark" data-theme="dark">
      {Sizes.render?.(args, context)}
    </div>
  ),
};
