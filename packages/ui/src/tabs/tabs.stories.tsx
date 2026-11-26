import "./tabs.stories.css";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Badge } from "../badge/index.js";
import { Button } from "../button/index.js";
import { Card } from "../card/index.js";
import { DollarIcon, TrendingUpIcon, UsersIcon } from "../icons.js";
import { Input } from "../input/index.js";
import { Tabs } from "./index.js";

const meta = {
  title: "Components/Tabs",
  component: Tabs.Root,
  args: { defaultValue: "account" },
  argTypes: {
    defaultValue: { control: "inline-radio", options: ["account", "password", "billing"] },
  },
  decorators: [
    (Story) => (
      <div className="tabs-story-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tabs.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof Input>) {
  const id = useId();
  return (
    <div className="tabs-story-field">
      <label className="tabs-story-label" htmlFor={id}>
        {label}
      </label>
      <Input id={id} {...props} />
    </div>
  );
}

function SettingsPanels({ keepAccountMounted }: { keepAccountMounted?: boolean }) {
  return (
    <>
      <Tabs.Panel value="account" keepMounted={keepAccountMounted}>
        <div className="tabs-story-stack">
          <Field label="Full name" defaultValue="Ana Torres" autoComplete="name" />
          <Field label="Email" type="email" defaultValue="ana@example.com" autoComplete="email" />
          <div>
            <Button>Save changes</Button>
          </div>
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="password">
        <div className="tabs-story-stack">
          <Field label="Current password" type="password" autoComplete="current-password" />
          <Field label="New password" type="password" autoComplete="new-password" />
          <div>
            <Button>Update password</Button>
          </div>
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="billing">
        <div className="tabs-story-stack">
          <div className="tabs-story-row">
            <h3 className="tabs-story-title">Team plan</h3>
            <Badge size="sm" variant="success">
              Active
            </Badge>
          </div>
          <p className="tabs-story-text">$12 per seat, billed monthly. Next invoice on Dec 1.</p>
          <div className="tabs-story-row">
            <Button variant="secondary">Change plan</Button>
            <Button variant="ghost">Download invoices</Button>
          </div>
        </div>
      </Tabs.Panel>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <Card.Root>
      <Card.Header>
        <h2 className="tabs-story-heading">Settings</h2>
        <p className="tabs-story-text">Manage your profile, security and plan.</p>
      </Card.Header>
      <Tabs.Root {...args}>
        <Tabs.List aria-label="Settings">
          <Tabs.Tab value="account">Account</Tabs.Tab>
          <Tabs.Tab value="password">Password</Tabs.Tab>
          <Tabs.Tab value="billing">Billing</Tabs.Tab>
        </Tabs.List>
        <SettingsPanels keepAccountMounted />
      </Tabs.Root>
    </Card.Root>
  ),
};

export const FullWidth: Story = {
  args: { defaultValue: "sign-in" },
  render: (args) => (
    <Card.Root className="tabs-story-narrow">
      <Tabs.Root {...args}>
        <Tabs.List aria-label="Access" className="tabs-story-full">
          <Tabs.Tab value="sign-in">Sign in</Tabs.Tab>
          <Tabs.Tab value="sign-up">Create account</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="sign-in">
          <form className="tabs-story-stack" onSubmit={(event) => event.preventDefault()}>
            <Field label="Email" type="email" autoComplete="email" />
            <Field label="Password" type="password" autoComplete="current-password" />
            <Button type="submit">Sign in</Button>
          </form>
        </Tabs.Panel>
        <Tabs.Panel value="sign-up">
          <form className="tabs-story-stack" onSubmit={(event) => event.preventDefault()}>
            <Field label="Full name" autoComplete="name" />
            <Field label="Email" type="email" autoComplete="email" />
            <Field label="Password" type="password" autoComplete="new-password" />
            <Button type="submit">Create account</Button>
          </form>
        </Tabs.Panel>
      </Tabs.Root>
    </Card.Root>
  ),
};

const metrics = [
  { label: "Revenue", value: "$48,200", change: "+12.5%" },
  { label: "Customers", value: "1,284", change: "+4.1%" },
  { label: "Avg. order", value: "$37.50", change: "+2.3%" },
] as const;

export const WithIcons: Story = {
  args: { defaultValue: "overview" },
  render: (args) => (
    <Tabs.Root {...args}>
      <Tabs.List aria-label="Dashboard">
        <Tabs.Tab value="overview" className="tabs-story-tab">
          <TrendingUpIcon aria-hidden="true" size={16} strokeWidth={1.75} />
          Overview
        </Tabs.Tab>
        <Tabs.Tab value="customers" className="tabs-story-tab">
          <UsersIcon aria-hidden="true" size={16} strokeWidth={1.75} />
          Customers
        </Tabs.Tab>
        <Tabs.Tab value="billing" className="tabs-story-tab">
          <DollarIcon aria-hidden="true" size={16} strokeWidth={1.75} />
          Billing
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">
        <div className="tabs-story-grid">
          {metrics.map(({ label, value, change }) => (
            <Card.Root key={label}>
              <p className="tabs-story-text">{label}</p>
              <p className="tabs-story-value">{value}</p>
              <p className="tabs-story-caption">{change} vs last month</p>
            </Card.Root>
          ))}
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="customers">
        <p className="tabs-story-text">1,284 customers, 86 of them new this month.</p>
      </Tabs.Panel>
      <Tabs.Panel value="billing">
        <p className="tabs-story-text">No invoices are due.</p>
      </Tabs.Panel>
    </Tabs.Root>
  ),
};

export const Overflow: Story = {
  args: { defaultValue: "overview" },
  render: (args, context) => (
    <div className="tabs-story-compact">{WithIcons.render?.(args, context)}</div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist");
    const billing = canvas.getByRole("tab", { name: "Billing" });
    const root = list.parentElement as HTMLElement;
    await expect(list.getBoundingClientRect().right).toBeLessThanOrEqual(
      root.getBoundingClientRect().right,
    );
    await canvasElement.ownerDocument.fonts.ready;
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    await expect(billing).toHaveFocus();
    await expect(billing.getBoundingClientRect().right).toBeLessThanOrEqual(
      list.getBoundingClientRect().right,
    );
    await userEvent.keyboard("{Enter}");
    await expect(billing).toHaveAttribute("aria-selected", "true");
  },
};

export const RightToLeft: Story = {
  render: (args, context) => (
    <div className="tabs-story-stack" dir="rtl">
      {Default.render?.(args, context)}
      <div className="tabs-story-compact">
        {WithIcons.render?.({ ...args, defaultValue: "overview" }, context)}
      </div>
    </div>
  ),
};

export const WithDisabledTab: Story = {
  render: (args) => (
    <Tabs.Root {...args}>
      <Tabs.List aria-label="Settings">
        <Tabs.Tab value="account">Account</Tabs.Tab>
        <Tabs.Tab value="password" disabled>
          Password
        </Tabs.Tab>
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
      </Tabs.List>
      <SettingsPanels />
    </Tabs.Root>
  ),
};

export const ForcedStates: Story = {
  render: (args) => (
    <Tabs.Root {...args}>
      <Tabs.List aria-label="Tab states">
        <Tabs.Tab value="account">Selected</Tabs.Tab>
        <Tabs.Tab value="password" data-hovered>
          Hovered
        </Tabs.Tab>
        <Tabs.Tab value="billing" data-focus-visible>
          Focus visible
        </Tabs.Tab>
        <Tabs.Tab value="alerts" disabled>
          Disabled
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="account">Selected panel</Tabs.Panel>
      <Tabs.Panel value="password">Hovered panel</Tabs.Panel>
      <Tabs.Panel value="billing">Focus panel</Tabs.Panel>
      <Tabs.Panel value="alerts">Disabled panel</Tabs.Panel>
    </Tabs.Root>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("password");
    return (
      <div className="tabs-story-stack">
        <Tabs.Root value={value} onValueChange={setValue}>
          <Tabs.List aria-label="Settings">
            <Tabs.Tab value="account">Account</Tabs.Tab>
            <Tabs.Tab value="password">Password</Tabs.Tab>
            <Tabs.Tab value="billing">Billing</Tabs.Tab>
          </Tabs.List>
          <SettingsPanels />
        </Tabs.Root>
        <div className="tabs-story-row">
          <p className="tabs-story-text">Selected: {value}</p>
          <Button size="sm" variant="secondary" onClick={() => setValue("billing")}>
            Go to billing
          </Button>
        </div>
      </div>
    );
  },
};

export const KeyboardNavigation: Story = {
  render: (args) => (
    <Tabs.Root {...args}>
      <Tabs.List aria-label="Settings">
        <Tabs.Tab value="account">Account</Tabs.Tab>
        <Tabs.Tab value="password" disabled>
          Password
        </Tabs.Tab>
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
      </Tabs.List>
      <SettingsPanels />
    </Tabs.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const account = canvas.getByRole("tab", { name: "Account" });
    const password = canvas.getByRole("tab", { name: "Password" });
    const billing = canvas.getByRole("tab", { name: "Billing" });
    await userEvent.tab();
    await expect(account).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(password).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(password).toHaveAttribute("aria-selected", "false");
    await userEvent.keyboard("{ArrowRight}");
    await expect(billing).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(account).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(billing).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(billing).toHaveAttribute("aria-selected", "true");
    await expect(account).toHaveAttribute("aria-selected", "false");
  },
};

export const DefaultDark: Story = {
  render: (args, context) => (
    <div className="tabs-story-dark" data-theme="dark">
      <div>{Default.render?.(args, context)}</div>
    </div>
  ),
};

export const FullWidthDark: Story = {
  args: { defaultValue: "sign-in" },
  render: (args, context) => (
    <div className="tabs-story-dark" data-theme="dark">
      <div>{FullWidth.render?.(args, context)}</div>
    </div>
  ),
};

export const ForcedStatesDark: Story = {
  render: (args, context) => (
    <div className="tabs-story-dark" data-theme="dark">
      <div>{ForcedStates.render?.(args, context)}</div>
    </div>
  ),
};
