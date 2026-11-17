import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  staticDirs: [{ from: "../../../packages/assets", to: "/assets" }],
  stories: ["../stories/**/*.stories.tsx", "../../../packages/ui/src/**/*.stories.tsx"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs", "@storybook/addon-vitest"],
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      resolve: {
        alias: [{ find: /^@\//, replacement: fileURLToPath(new URL("../src/", import.meta.url)) }],
      },
    }),
};

export default config;
