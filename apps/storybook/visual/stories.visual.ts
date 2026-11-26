import { readFileSync } from "node:fs";
import { expect, type Locator, type Page, test } from "@playwright/test";

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

test("overflow tabs bring Billing fully into view with a slow font load", async ({ page }) => {
  await page.route("**/figtree-latin-wght-normal-*.woff2", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });
  await openStory(page, "components-tabs--overflow", "dark");
  const billing = page.getByRole("tab", { name: "Billing" });
  await expect(billing).toHaveAttribute("aria-selected", "true");
  await expect(billing).toBeInViewport({ ratio: 1 });
});

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

function boundaryContrast(input: Locator, backdrop: string) {
  return input.evaluate((field, backdrop) => {
    const surface = field.closest(backdrop);
    const context = document.createElement("canvas").getContext("2d");
    if (!surface || !context) throw new Error("Missing surface or canvas context");

    const sample = () => {
      const [r = 0, g = 0, b = 0] = Array.from(context.getImageData(0, 0, 1, 1).data, (byte) => {
        const channel = byte / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const paint = (color: string) => {
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
    };

    paint(getComputedStyle(surface).backgroundColor);
    const background = sample();
    const style = getComputedStyle(field);
    paint(style.backgroundColor);
    if (Number.parseFloat(style.borderTopWidth) > 0) paint(style.borderTopColor);
    const boundary = sample();
    return (Math.max(background, boundary) + 0.05) / (Math.min(background, boundary) + 0.05);
  }, backdrop);
}

for (const theme of ["light", "dark"]) {
  test(`empty Input boundary on a card (${theme})`, async ({ page }) => {
    await openStory(page, "components-input--in-a-form", theme);
    const input = page.getByLabel("Full name");
    await expect(input).toHaveValue("");
    expect(await boundaryContrast(input, ".pumba-card")).toBeGreaterThanOrEqual(3);
    await input.hover();
    expect(await boundaryContrast(input, ".pumba-card")).toBeGreaterThanOrEqual(3);
    await page.keyboard.press("Tab");
    await expect(input).toBeFocused();
    await expect(input).toHaveCSS("outline-style", "solid");
    expect(await boundaryContrast(input, ".pumba-card")).toBeGreaterThanOrEqual(3);
  });

  test(`empty Input boundary in a dialog (${theme})`, async ({ page }) => {
    await openStory(page, "components-dialog--with-form", theme);
    await page.getByRole("button", { name: "Invite teammate" }).click();
    const input = page.getByRole("dialog").getByLabel("Email");
    await expect(input).toHaveValue("");
    expect(await boundaryContrast(input, ".pumba-dialog")).toBeGreaterThanOrEqual(3);
  });
}

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
