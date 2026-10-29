import type { Meta, StoryObj } from "@storybook/react-vite";
import { __Name__ } from "./__name__.js";

const meta = {
  title: "Components/__Name__",
  component: __Name__,
  args: { children: "__Name__" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof __Name__>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = { args: { size: "sm" } };

export const Large: Story = { args: { size: "lg" } };

export const Hovered: Story = {
  render: (args) => <__Name__ {...args} data-hovered />,
};

export const Pressed: Story = {
  render: (args) => <__Name__ {...args} data-pressed />,
};

export const FocusVisible: Story = {
  render: (args) => <__Name__ {...args} data-focus-visible />,
};
