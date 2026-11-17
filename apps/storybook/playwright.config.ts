import { defineConfig, devices } from "@playwright/test";

const port = 6107;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "visual",
  testMatch: "**/*.visual.ts",
  forbidOnly: isCI,
  retries: 0,
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : "list",
  expect: {
    toHaveScreenshot: { animations: "disabled", maxDiffPixelRatio: 0.001 },
  },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://localhost:${port}`,
    viewport: { width: 900, height: 700 },
    colorScheme: "light",
    reducedMotion: "reduce",
  },
  projects: [{ name: "chromium" }],
  webServer: {
    command: `vite preview --outDir storybook-static --port ${port} --strictPort`,
    url: `http://localhost:${port}/iframe.html`,
    reuseExistingServer: !isCI,
  },
});
