import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";

type Entry = { id: string; type: string };

const indexFile = new URL("../storybook-static/index.json", import.meta.url);
const { entries } = JSON.parse(readFileSync(indexFile, "utf8")) as {
  entries: Record<string, Entry>;
};

const stories = Object.values(entries).filter((entry) => entry.type === "story");

async function openStory(page: Page, id: string, theme: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`);
  await page.waitForFunction(() => {
    const preview = (window as { __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } } })
      .__STORYBOOK_PREVIEW__;
    return preview?.currentRender?.phase === "finished";
  });
  await page.evaluate(() => document.fonts.ready);
}

for (const { id } of stories) {
  const themes = id.endsWith("-dark") ? ["light"] : ["light", "dark"];
  for (const theme of themes) {
    test(`${id} (${theme})`, async ({ page }) => {
      await openStory(page, id, theme);
      await expect(page).toHaveScreenshot([theme, `${id}.png`], { fullPage: true });
    });
  }
}

test.describe("forced colors", () => {
  test.use({ forcedColors: "active" });

  test("selected tab keeps a distinct fill after focus leaves the tab list", async ({ page }) => {
    await openStory(page, "components-tabs--default", "light");
    const account = page.getByRole("tab", { name: "Account" });
    const password = page.getByRole("tab", { name: "Password" });
    const panel = page.getByRole("tabpanel", { name: "Password" });

    await account.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(password).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Tab");
    await expect(panel).toBeFocused();
    const inactiveFill = await account.evaluate((tab) => getComputedStyle(tab).backgroundColor);
    await expect(password).not.toHaveCSS("background-color", inactiveFill);
  });
});

test.describe("320px story layouts", () => {
  test.use({ viewport: { width: 320, height: 700 } });

  const cases = [
    { id: "components-input--forced-states-dark", selector: "input", bounds: "#storybook-root" },
    {
      id: "components-card--horizontal",
      selector: ".card-story-horizontal :is(img, h3, p, button)",
      bounds: ".card-story-horizontal",
    },
    {
      id: "components-card--horizontal-dark",
      selector: ".card-story-horizontal :is(img, h3, p, button)",
      bounds: ".card-story-horizontal",
    },
    { id: "foundations-tokens--space", selector: ".tokens-bar", bounds: ".tokens-page" },
  ];

  for (const { id, selector, bounds } of cases) {
    for (const theme of ["light", "dark"]) {
      test(`${id} fits (${theme})`, async ({ page }) => {
        await openStory(page, id, theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);

        const elements = page.locator(selector);
        await expect(elements).not.toHaveCount(0);
        const overflowing = await elements.evaluateAll((items, bounds) => {
          const parent = document.querySelector(bounds)?.getBoundingClientRect();
          if (!parent) throw new Error(`Missing story bounds: ${bounds}`);

          return items.flatMap((item) => {
            const { left, right } = item.getBoundingClientRect();
            return left >= parent.left && right <= parent.right ? [] : [item.outerHTML];
          });
        }, bounds);
        expect(overflowing).toEqual([]);
      });
    }
  }
});
