import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

type Entry = { id: string; type: string };

const indexFile = new URL("../storybook-static/index.json", import.meta.url);
const { entries } = JSON.parse(readFileSync(indexFile, "utf8")) as {
  entries: Record<string, Entry>;
};

const stories = Object.values(entries).filter((entry) => entry.type === "story");

for (const { id } of stories) {
  const themes = id.endsWith("-dark") ? ["light"] : ["light", "dark"];
  for (const theme of themes) {
    test(`${id} (${theme})`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`);
      await page.waitForFunction(() => {
        const preview = (
          window as { __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } } }
        ).__STORYBOOK_PREVIEW__;
        return preview?.currentRender?.phase === "finished";
      });
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot([theme, `${id}.png`], { fullPage: true });
    });
  }
}
