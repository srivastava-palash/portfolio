/* npm run test:browser — local, offline browser checks; contact requests are mocked. */
const { chromium } = require("playwright");
const { default: AxeBuilder } = require("@axe-core/playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "test-results");
const origin = "https://portfolio.test";
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
};
const chrome =
  process.env.CHROME_PATH ||
  (process.platform === "darwin" &&
  fs.existsSync("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : undefined);

async function serve(page, assetsMissing) {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    const file = path.join(
      root,
      decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname)
    );
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) {
      assetsMissing.push(url.pathname);
      return route.fulfill({ status: 404, body: "Not found" });
    }
    return route.fulfill({
      body: fs.readFileSync(file),
      contentType: mime[path.extname(file)] || "application/octet-stream",
    });
  });
}
async function jump(page, id) {
  await page
    .locator(id)
    .evaluate((element) =>
      element.scrollIntoView({ behavior: "instant", block: "start" })
    );
  await page.waitForTimeout(100);
}
async function audit(page, label) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    results.violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map((node) => node.target),
    })),
    [],
    label + " accessibility violations"
  );
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    executablePath: chrome,
    headless: true,
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    const errors = [],
      missing = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await serve(page, missing);
    await page.goto(origin);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.locator("#devops-terminal").isVisible(), false);
    assert(
      await page.locator("h1").isVisible(),
      "Visitors should see content immediately"
    );
    await page.screenshot({ path: path.join(output, "desktop-hero.png") });
    await audit(page, "Desktop");
    console.log("PASS initial content, local fonts, and desktop accessibility");

    await page.getByRole("tab", { name: "01 Delivery" }).focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(
      await page
        .getByRole("tab", { name: "02 Runtime" })
        .getAttribute("aria-selected"),
      "true"
    );
    assert.equal(
      await page.locator("#inspector-link").getAttribute("href"),
      "#proj-cloud"
    );
    await page.keyboard.press("End");
    assert.equal(
      await page
        .getByRole("tab", { name: "03 Signals" })
        .getAttribute("aria-selected"),
      "true"
    );
    await page.locator(".node-source").click();
    assert.equal(
      await page
        .getByRole("tab", { name: "01 Delivery" })
        .getAttribute("aria-selected"),
      "true"
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await page
        .locator(".wire-flow")
        .evaluate((el) => getComputedStyle(el).animationName),
      "none"
    );
    await page.locator("#run-demo").click();
    await page.waitForFunction(
      () => !document.getElementById("run-demo").disabled
    );
    assert.match(
      await page.locator("#demo-status").innerText(),
      /DEMO COMPLETE/
    );
    console.log(
      "PASS architecture tabs, node selection, release simulation, and reduced motion"
    );

    await jump(page, "#projects");
    await page.screenshot({ path: path.join(output, "desktop-work.png") });
    for (const card of await page.locator(".case-study").all()) {
      const summary = card.locator("summary");
      await summary.hover();
      assert.equal(
        await summary.evaluate((el) => getComputedStyle(el).backgroundColor),
        "rgb(223, 232, 216)"
      );
      assert(await summary.locator(".notes-expand").isVisible());
      await summary.click();
      assert(await card.locator("dd").first().isVisible());
      assert(await summary.locator(".notes-collapse").isVisible());
      await summary.press("Space");
      assert.equal(
        await card.locator("details").evaluate((el) => el.open),
        false
      );
    }
    for (const role of await page.locator(".experience-row").all()) {
      assert.equal(await role.locator("details").count(), 0);
      assert.equal(await role.locator(":scope > div > p").count(), 4);
      assert(await role.locator(":scope > div > p").nth(2).isVisible());
    }
    await jump(page, "#experience");
    await page.screenshot({
      path: path.join(output, "desktop-experience.png"),
    });
    const [resumeDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.locator(".hero-actions a[download]").click(),
    ]);
    assert.equal(resumeDownload.suggestedFilename(), "PalashSrivastava.pdf");
    // Verify payload separately: Chromium can cancel downloads fulfilled by route mocks.
    const resumeBytes = await page.evaluate(async () =>
      Array.from(
        new Uint8Array(await (await fetch("PalashSrivastava.pdf")).arrayBuffer())
      )
    );
    assert.deepEqual(
      Buffer.from(resumeBytes),
      fs.readFileSync(path.join(root, "PalashSrivastava.pdf"))
    );
    await page.keyboard.press("Control+k");
    assert(await page.locator("#command-dialog").isVisible());
    await page.locator("#command-search").fill("toolkit");
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("#command-dialog").isVisible(), false);
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "skills"
    );
    await page.keyboard.press("Control+k");
    await page.locator("#command-search").fill("zzzz-no-match");
    assert(await page.locator(".command-empty").isVisible());
    await page.keyboard.press("Escape");
    await page.keyboard.press("Control+k");
    await page.locator("#command-search").fill("terminal");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(700);
    assert(await page.locator("#devops-terminal").isVisible());
    assert.equal(await page.locator("main").evaluate((el) => el.inert), true);
    await page.locator("#dt-input").fill("cat constructor");
    await page.locator("#dt-input").press("Enter");
    assert.match(await page.locator("#dt-body").innerText(), /No such file/);
    await page.locator("#dt-input").press("Tab");
    // Terminal uses Tab for autocomplete; Shift+Tab still reaches Close.
    await page.keyboard.press("Shift+Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "dt-exit"
    );
    await page.keyboard.press("Escape");
    await page.waitForTimeout(450);
    assert.equal(await page.locator("main").evaluate((el) => el.inert), false);
    console.log(
      "PASS engineering notes, career details, command search, and terminal focus"
    );

    let requests = 0,
      status = 500,
      invalidBody = false;
    await page.route("https://api.web3forms.com/submit", async (route) => {
      requests++;
      await route.fulfill({
        status,
        contentType: "application/json",
        body: invalidBody ? "invalid-json" : '{"success":true}',
      });
    });
    await jump(page, "#contact");
    await page.locator("#cf-name").fill("Test User");
    await page.locator("#cf-email").fill("invalid");
    await page.locator("#cf-message").fill("Browser test message");
    await page.locator("#cf-submit-btn").click();
    assert.equal(requests, 0);
    await page.locator("#cf-email").fill("test@example.com");
    await page.locator("#cf-name").fill("   ");
    await page.locator("#cf-submit-btn").click();
    assert.equal(requests, 0);
    await page.locator("#cf-name").fill("Test User");
    await page.locator("#cf-submit-btn").click();
    await page.waitForFunction(
      () => !document.getElementById("cf-submit-btn").disabled
    );
    assert(await page.locator("#cf-error").isVisible());
    assert.equal(await page.locator("#cf-name").inputValue(), "Test User");
    status = 200;
    invalidBody = true;
    await page.locator("#cf-submit-btn").click();
    await page.waitForFunction(
      () => !document.getElementById("cf-submit-btn").disabled
    );
    assert(await page.locator("#cf-error").isVisible());
    invalidBody = false;
    await page.locator("#cf-submit-btn").click();
    await page.waitForFunction(
      () => !document.getElementById("cf-submit-btn").disabled
    );
    assert(await page.locator("#cf-success").isVisible());
    assert.equal(await page.locator("#cf-name").inputValue(), "");
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__copiedEmail = text;
          },
        },
      });
    });
    await page.locator("#copy-email").click();
    assert.equal(
      await page.evaluate(() => window.__copiedEmail),
      "srivastavapalash0@gmail.com"
    );
    console.log(
      "PASS contact validation, mocked failure/success, malformed responses, and copy email"
    );

    for (const [width, height] of [
      [1440, 1000],
      [1024, 900],
      [768, 1000],
      [390, 844],
      [320, 720],
    ]) {
      await page.setViewportSize({ width, height });
      await jump(page, "#skills");
      await page.waitForFunction(() =>
        [...document.querySelectorAll("#tech-logo-grid img")].every(
          (img) => img.complete && img.naturalWidth > 0
        )
      );
      assert.equal(await page.locator("#tech-logo-grid img").count(), 14);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        ),
        "Page overflow at " + width
      );
      const overflow = await page
        .locator(
          ".tech-logo-card, .case-study, .system-panel, .credentials article, .contact-form-wrap"
        )
        .evaluateAll((els) =>
          els
            .filter((el) => el.scrollWidth > el.clientWidth + 1)
            .map((el) => el.className)
        );
      assert.deepEqual(overflow, [], "Component overflow at " + width);
      const smallType = await page
        .locator(".experience-date, .experience-tags")
        .evaluateAll((elements) =>
          elements
            .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 12)
            .map((el) => el.className)
        );
      assert.deepEqual(smallType, [], "Experience text below 12px at " + width);
      if (width === 390) {
        await jump(page, "#experience");
        await page.screenshot({
          path: path.join(output, "mobile-experience.png"),
        });
        await jump(page, "#skills");
        await page.screenshot({
          path: path.join(output, "mobile-toolkit.png"),
        });
        await page.locator("#hamburger").click();
        assert.equal(
          await page.locator("#hamburger").getAttribute("aria-expanded"),
          "true"
        );
        await page.locator('#site-navigation a[href="#projects"]').click();
        assert.equal(
          await page.locator("#hamburger").getAttribute("aria-expanded"),
          "false"
        );
        await jump(page, "#hero");
        await page.screenshot({ path: path.join(output, "mobile-hero.png") });
        await audit(page, "Mobile");
      }
      console.log(
        "PASS " + width + "px: 14 logos loaded, no page or component overflow"
      );
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await jump(page, "#hero");
    await page.screenshot({
      path: path.join(output, "desktop-full.png"),
      fullPage: true,
    });
    assert.deepEqual(missing, []);
    assert.deepEqual(errors, []);
    const noJS = await browser.newPage({
      javaScriptEnabled: false,
      viewport: { width: 1280, height: 900 },
    });
    await serve(noJS, missing);
    await noJS.goto(origin);
    assert(await noJS.locator("h1").isVisible());
    assert(await noJS.locator("#proj-cicd summary").isVisible());
    assert.equal(await noJS.locator("#devops-terminal").isVisible(), false);
    console.log(
      "PASS no JavaScript fallback, no missing local assets, and no browser errors"
    );
    console.log("Previews saved in test-results/.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
