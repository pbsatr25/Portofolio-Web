import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/cv", "/work/antistun"];

for (const route of routes) {
  test(`${route}: no serious a11y violations, no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(route);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("home HTML carries the h1 and every section's text", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Prihastomo Budi Satrio");
    for (const text of [
      "I BUILD AI",
      "About me",
      "pgvector",
      "Ask my CV",
      "Prompt",
      "Read the case study",
      "Head of Software",
      "SAY HELLO",
    ]) {
      await expect(page.getByText(text).first()).toBeAttached();
    }
    for (const slug of ["antistun", "shardfall", "iku-chatbot", "egolek"]) {
      await expect(page.locator(`a[href="/work/${slug}"]`)).toBeAttached();
    }
  });
});

test("unknown case study returns a real 404", async ({ request }) => {
  expect((await request.get("/work/nope")).status()).toBe(404);
});

test("reduced motion: page renders all sections", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("main > section")).toHaveCount(8);
  await context.close();
});

test.describe("with motion (regular browser UA, so the motion gate is on)", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  });

  test("loader clears within 7 s, intro is visible, nothing overflows, no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/motion/);
    await expect(page.locator("[data-loader]")).toBeHidden({ timeout: 7000 });
    await expect(page.locator("h1")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator("#contact-title")).toBeInViewport({ timeout: 10000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    expect(errors).toEqual([]);
  });

  test("statement: every line stays on screen while the section is pinned", async ({ page }) => {
    // A laptop-height viewport: the section is taller than the screen here, which is where the bug showed.
    await page.setViewportSize({ width: page.viewportSize()!.width, height: 720 });
    await page.goto("/");
    await expect(page.locator("[data-loader]")).toBeHidden({ timeout: 9000 });
    await expect(page.locator("html")).toHaveClass(/intro-done/);
    await page.waitForTimeout(800); // let ScrollTrigger's post-loader refresh and the Lenis reset finish
    // scroll into the middle of the pin (measured in normal flow, with the sticky stacking switched off)
    await page.evaluate(() => {
      const spacer = document.querySelector("[data-statement-pin]")!.closest(".pin-spacer") as HTMLElement;
      const stack = spacer.closest("[data-stack]") as HTMLElement;
      stack.style.position = "static";
      const y = spacer.getBoundingClientRect().top + scrollY + spacer.offsetHeight / 2 - innerHeight / 2;
      stack.style.position = "";
      scrollTo(0, y);
    });
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            [...document.querySelectorAll("[data-statement-line]")].filter((el) => {
              const r = el.getBoundingClientRect();
              return r.top < 0 || r.bottom > innerHeight;
            }).length,
        ),
      )
      .toBe(0);
  });

  test("a link to /#play lands on Play once the loader is done, and the page still scrolls", async ({ page }) => {
    await page.goto("/#play");
    await expect(page.locator("[data-loader]")).toBeHidden({ timeout: 9000 });
    await expect
      .poll(() => page.evaluate(() => Math.round(document.querySelector("#play")!.getBoundingClientRect().top)))
      .toBe(0);
    const y = await page.evaluate(() => scrollY);
    await page.evaluate((y) => scrollTo(0, y - 1500), y);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(y - 1000);
  });

  test("loader shows once per session", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-loader]")).toBeHidden({ timeout: 7000 });
    await page.reload();
    await expect(page.locator("html")).not.toHaveClass(/loading/);
  });
});

test.describe("game", () => {
  // Reduced motion: no loader and no stacked sections, so the test exercises the game itself.
  test.use({ reducedMotion: "reduce" });

  test("Prompt Defender: Play opens the game, a click fires, Esc closes and returns focus", async ({ page }) => {
    await page.goto("/#play");
    const play = page.getByRole("button", { name: "Play game" });
    await play.click();
    const dialog = page.getByRole("dialog", { name: "Prompt Defender" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Start" }).click();

    const ammo = dialog.locator('[aria-label$="citations"]');
    await expect(ammo).toHaveAttribute("aria-label", "12 of 18 citations");
    const box = (await dialog.locator("canvas").boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 3);
    await expect(ammo).toHaveAttribute("aria-label", "11 of 18 citations");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(play).toBeFocused();
  });
});
