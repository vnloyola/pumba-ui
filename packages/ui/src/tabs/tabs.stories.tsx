import "./tabs.stories.css";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../button/index.js";
import { Card } from "../card/index.js";
import { DollarIcon, TrendingUpIcon, UsersIcon } from "../icons.js";
import { Input } from "../input/index.js";
import { Tabs } from "./tabs.js";

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

function SettingsPanels() {
  return (
    <>
      <Tabs.Panel value="account">
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
        <p className="tabs-story-text">
          You are on the Team plan, billed monthly. Your next invoice is on the 1st.
        </p>
      </Tabs.Panel>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <Tabs.Root {...args}>
      <Tabs.List aria-label="Settings">
        <Tabs.Tab value="account">Account</Tabs.Tab>
        <Tabs.Tab value="password">Password</Tabs.Tab>
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
      </Tabs.List>
      <SettingsPanels />
    </Tabs.Root>
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

const metrics = [
  { label: "Revenue", value: "$48,200", icon: DollarIcon },
  { label: "Customers", value: "1,284", icon: UsersIcon },
  { label: "Growth", value: "+12.5%", icon: TrendingUpIcon },
] as const;

export const WithIcons: Story = {
  args: { defaultValue: "overview" },
  render: (args) => (
    <Tabs.Root {...args}>
      <Tabs.List aria-label="Dashboard">
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="reports">Reports</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">
        <div className="tabs-story-grid">
          {metrics.map(({ label, value, icon: Icon }) => (
            <Card.Root key={label}>
              <Card.Header>
                <p className="tabs-story-text">
                  <Icon aria-hidden="true" size={16} /> {label}
                </p>
              </Card.Header>
              <Card.Content>
                <p className="tabs-story-value">{value}</p>
              </Card.Content>
            </Card.Root>
          ))}
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="reports">
        <p className="tabs-story-text">No reports have been generated yet.</p>
      </Tabs.Panel>
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

export const ForcedStatesDark: Story = {
  render: (args, context) => (
    <div className="tabs-story-dark" data-theme="dark">
      <div>{ForcedStates.render?.(args, context)}</div>
    </div>
  ),
};
