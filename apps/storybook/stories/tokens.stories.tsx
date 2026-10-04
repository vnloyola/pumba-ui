import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColorSection } from "@/color/color-section.js";
import { MotionSection } from "@/motion/motion-section.js";
import { RadiusSection } from "@/radius/radius-section.js";
import { ShadowSection } from "@/shadow/shadow-section.js";
import { SpaceSection } from "@/space/space-section.js";
import { TypographySection } from "@/typography/typography-section.js";

const meta = {
  title: "Foundations/Tokens",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Colors: Story = { render: () => <ColorSection /> };
export const Space: Story = { render: () => <SpaceSection /> };
export const Radius: Story = { render: () => <RadiusSection /> };
export const Shadow: Story = { render: () => <ShadowSection /> };
export const Typography: Story = { render: () => <TypographySection /> };
export const Motion: Story = { render: () => <MotionSection /> };
