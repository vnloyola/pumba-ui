import "@pumba-ui/ui/styles.css";
import "./preview.css";
import type { Decorator, Preview } from "@storybook/react-vite";
import { useLayoutEffect } from "react";

type Theme = "system" | "light" | "dark";

function ThemeFrame({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = theme;
    }
  }, [theme]);

  return children;
}

const withTheme: Decorator = (Story, context) => (
  <ThemeFrame theme={context.globals.theme as Theme}>
    <Story />
  </ThemeFrame>
);

const preview: Preview = {
  tags: ["autodocs"],
  decorators: [withTheme],
  initialGlobals: { theme: "system" },
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "circlehalf",
        dynamicTitle: true,
        items: [
          { value: "system", title: "System" },
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  parameters: {
    backgrounds: { disabled: true },
    layout: "fullscreen",
  },
};

export default preview;
