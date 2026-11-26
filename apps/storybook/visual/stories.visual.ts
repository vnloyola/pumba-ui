import { readFileSync } from "node:fs";
import { expect, type Locator, type Page, test } from "@playwright/test";

type Entry = { id: string; type: string };

const indexFile = new URL("../storybook-static/index.json", import.meta.url);
const { entries } = JSON.parse(readFileSync(indexFile, "utf8")) as {
  entries: Record<string, Entry>;
};

const stories = Object.values(entries).filter((entry) => entry.type === "story");

async function openStory(page: Page, id: string, theme: string, args?: string) {
  const params = new URLSearchParams({ id, viewMode: "story", globals: `theme:${theme}` });
  if (args) params.set("args", args);
  await page.goto(`/iframe.html?${params}`);
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

test("RTL Tabs show fades only on edges with overflow", async ({ page }) => {
  await openStory(page, "components-tabs--right-to-left", "light");
  const list = page.getByRole("tablist", { name: "Dashboard" });
  const edge = (side: "before" | "after") =>
    list.evaluate((element, side) => {
      const { left, right, opacity, backgroundImage } = getComputedStyle(element, `::${side}`);
      return { left, right, opacity, backgroundImage };
    }, side);

  await expect
    .poll(() => edge("after"))
    .toMatchObject({
      left: expect.not.stringMatching(/^auto$/),
      right: "auto",
      opacity: "1",
      backgroundImage: expect.stringContaining("to right"),
    });
  await expect.poll(() => edge("before")).toMatchObject({ opacity: "0" });
  await list.evaluate((element) => {
    element.scrollLeft = -element.scrollWidth;
  });
  await expect
    .poll(() => edge("before"))
    .toMatchObject({
      left: "auto",
      right: expect.not.stringMatching(/^auto$/),
      opacity: "1",
      backgroundImage: expect.stringContaining("to left"),
    });
  await expect.poll(() => edge("after")).toMatchObject({ opacity: "0" });
});

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

  test("loading Buttons keep a visible gap in the spinner", async ({ page }) => {
    await openStory(page, "components-button--loading", "light");
    const buttons = page.getByRole("button", { name: "Saving" });
    await expect(buttons).toHaveCount(4);
    for (const button of await buttons.all()) {
      const spinner = await button.evaluate((element) => {
        const style = getComputedStyle(element, "::before");
        return {
          arc: style.borderBlockStartColor,
          gap: style.borderInlineEndColor,
        };
      });
      expect(spinner.arc).not.toBe("rgba(0, 0, 0, 0)");
      expect(spinner.gap).toBe("rgba(0, 0, 0, 0)");
    }
  });

  test("invalid and disabled Inputs remain distinct from filled Inputs", async ({ page }) => {
    await openStory(page, "components-input--forced-states", "light");
    const filled = page.getByRole("textbox", { name: "Filled" });
    const invalid = page.getByRole("textbox", { name: "Invalid" });
    const disabled = page.getByRole("textbox", { name: "Disabled" });

    const filledStyle = await filled.evaluate((input) => {
      const style = getComputedStyle(input);
      return {
        borderWidth: style.borderTopWidth,
        borderColor: style.borderTopColor,
        color: style.color,
      };
    });
    await expect(disabled).not.toHaveCSS("border-top-color", filledStyle.borderColor);
    await expect(invalid).not.toHaveCSS("border-top-width", filledStyle.borderWidth);
    await disabled.hover();
    await expect(disabled).not.toHaveCSS("color", filledStyle.color);
  });

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

  test("disabled tabs keep distinct text in forced colors", async ({ page }) => {
    await openStory(page, "components-tabs--with-disabled-tab", "light");
    const account = page.getByRole("tab", { name: "Account" });
    const disabled = page.getByRole("tab", { name: "Password" });
    const enabled = page.getByRole("tab", { name: "Billing" });

    await expect(disabled).toBeDisabled();
    const enabledColor = await enabled.evaluate((tab) => getComputedStyle(tab).color);
    await expect(disabled).not.toHaveCSS("color", enabledColor);
    await disabled.hover();
    await expect(disabled).not.toHaveCSS("color", enabledColor);

    await account.focus();
    await page.keyboard.press("ArrowRight");
    await expect(disabled).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(account).toHaveAttribute("aria-selected", "true");
  });

  test("a selected disabled tab keeps its text readable in forced colors", async ({ page }) => {
    const story = "components-tabs--with-disabled-tab";
    const disabled = page.getByRole("tab", { name: "Password" });
    await openStory(page, story, "light");
    const disabledColor = await disabled.evaluate((tab) => getComputedStyle(tab).color);

    await openStory(page, story, "light", "defaultValue:password");
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveAttribute("aria-selected", "true");
    const canvasColor = await page
      .locator("body")
      .evaluate((body) => getComputedStyle(body).backgroundColor);
    await expect(disabled).toHaveCSS("color", disabledColor);
    await expect(disabled).toHaveCSS("background-color", canvasColor);
    await expect(disabled).not.toHaveCSS("box-shadow", "none");
  });

  for (const theme of ["light", "dark"]) {
    test(`color swatches keep their token colors (${theme})`, async ({ page }) => {
      const readSwatches = () =>
        page
          .locator(".tokens-swatch-color")
          .evaluateAll((swatches) =>
            swatches.map((swatch) => getComputedStyle(swatch).backgroundColor),
          );

      await page.emulateMedia({ forcedColors: "none" });
      await openStory(page, "foundations-tokens--colors", theme);
      const authored = await readSwatches();
      await expect(page.locator(".tokens-swatch-color")).not.toHaveCount(0);

      await page.emulateMedia({ forcedColors: "active" });
      expect(await readSwatches()).toEqual(authored);
    });
  }
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
    { id: "components-input--forced-states", selector: "input", bounds: "#storybook-root" },
    {
      id: "components-card--default",
      selector: ".card-story-session :is(h3, p, span)",
      bounds: ".card-story-session",
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
