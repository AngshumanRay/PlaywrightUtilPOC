// =============================================================================
// pages/BasePage.ts — BASE PAGE CLASS (Page Object Model Foundation)
// =============================================================================
// PURPOSE:
//   This is the PARENT class that all other page classes inherit from.
//   It provides common, reusable browser actions that every page needs.
//
// WHAT IS THE PAGE OBJECT MODEL (POM)?
//   POM is a design pattern for organizing automation code. The idea is:
//     - Each PAGE of your web app gets its OWN CLASS (TypeScript file)
//     - The class holds:
//         a) LOCATORS: How to find elements on that page (buttons, inputs, etc.)
//         b) ACTIONS:  Methods that perform specific actions on that page
//     - Tests use these classes instead of directly interacting with the browser
//
//   BENEFITS of POM:
//     ✅ If a button's location changes, you only fix it in ONE place
//     ✅ Tests are easier to read (e.g., "loginPage.clickLoginButton()")
//     ✅ Code is reusable across many tests
//
// INHERITANCE (extends):
//   "extends BasePage" means a page class INHERITS all methods from BasePage.
//   Think of it like a recipe template:
//     - BasePage = base recipe with common techniques (boil water, season, etc.)
//     - LoginPage = specific recipe that uses the base techniques + its own steps
//
// WHAT IS A "LOCATOR"?
//   A locator is a description of HOW to find an HTML element on a web page.
//   Examples:
//     - By text:  page.getByRole('button', { name: 'Login' })
//     - By ID:    page.locator('#username')
//     - By CSS:   page.locator('.submit-btn')
//     - By label: page.getByLabel('Email address')
//   Playwright uses locators to find and interact with elements.
// =============================================================================

// Import Playwright types
// "Page" represents a single browser tab
// "Locator" represents a way to find an element on the page
// "FrameLocator" represents a way to find and interact with elements INSIDE an iframe
import { type Page, type Locator, type FrameLocator, expect } from '@playwright/test';

// Import our logger for consistent, formatted output
import { logger } from '../utils/helpers/logger';

// Import screenshot helper for capturing failure evidence
import { captureFailureScreenshot } from '../utils/helpers/screenshot';

// =============================================================================
// CLASS: BasePage
// =============================================================================
// All page classes in the "pages/" folder will extend (inherit from) this class.
// You should NOT instantiate BasePage directly — always use a specific page class.
// =============================================================================
export class BasePage {

  // The Playwright "Page" object — represents the actual browser tab
  // "protected" means this is accessible in BasePage AND all child classes,
  // but NOT accessible from outside the class hierarchy (e.g., from test files)
  protected page: Page;

  // The base URL of the application (loaded from environment config)
  protected baseUrl: string;

  // ==========================================================================
  // CONSTRUCTOR
  // ==========================================================================
  // PURPOSE:
  //   A constructor is the function that runs when you create a new object.
  //   Here: const loginPage = new LoginPage(page) → this constructor runs
  //
  // PARAMETERS:
  //   - page:    The Playwright Page object (passed in from the test)
  //   - baseUrl: The app's base URL (defaults to environment config value)
  // ==========================================================================
  constructor(page: Page, baseUrl: string = process.env['BASE_URL'] || '') {
    this.page    = page;
    this.baseUrl = baseUrl;
  }

  // ==========================================================================
  // METHOD: dismissCookieBanner
  // ==========================================================================
  // PURPOSE:
  //   Tries to find and click common cookie consent / "Accept All" buttons
  //   that many websites show on first visit.
  //
  // WHY IS THIS NEEDED?
  //   A cookie banner is a popup asking "Do you accept cookies?"
  //   If it appears on top of the page, Playwright cannot click the buttons
  //   underneath it — causing tests to fail for the wrong reason.
  //   This method looks for common "Accept" buttons and clicks them if found.
  //   If no cookie banner exists on the page, it silently does nothing.
  //
  // COMMON BUTTON TEXTS THIS HANDLES:
  //   "Accept All", "Accept Cookies", "I Accept", "OK", "Got it",
  //   "Allow All", "Agree", "Continue"
  //
  // USAGE: Call this after navigating to any page that may show a cookie banner.
  //   await basePage.dismissCookieBanner();
  // ==========================================================================
  async dismissCookieBanner(): Promise<void> {
    // List of common button texts used by cookie consent banners
    // We check for each one and click the first one that's visible
    const cookieButtonTexts = [
      /accept all/i,
      /accept cookies/i,
      /i accept/i,
      /allow all/i,
      /agree/i,
      /got it/i,
      /ok, got it/i,
      /continue/i,
    ];

    for (const text of cookieButtonTexts) {
      const btn = this.page.getByRole('button', { name: text });
      try {
        // Check if a button with this text is visible (timeout: 1 second)
        // We use a very short timeout so this check is fast if the button isn't there
        await btn.waitFor({ state: 'visible', timeout: 1000 });
        await btn.click();
        logger.info(`🍪 Cookie banner dismissed (clicked: "${text}")`);
        return; // Found and clicked — no need to check other texts
      } catch {
        // This button text wasn't found — try the next one
      }
    }
    // No cookie banner found — that's fine, many sites don't have one
  }

  // ==========================================================================
  // METHOD: navigate
  // ==========================================================================
  // PURPOSE:
  //   Opens a specific URL in the browser.
  //
  // HOW IT WORKS:
  //   - If you pass a relative path like "/login", it combines it with baseUrl
  //   - If you pass a full URL like "https://...", it uses that directly
  //   - After navigation, waits for the page to fully load
  //
  // PARAMETERS:
  //   - urlOrPath: Either a full URL or a path relative to baseUrl (e.g., "/login")
  //
  // USAGE EXAMPLE:
  //   await loginPage.navigate('/login');     // Opens baseUrl + "/login"
  //   await loginPage.navigate('https://google.com'); // Opens Google
  // ==========================================================================
  async navigate(urlOrPath: string): Promise<void> {
    // Determine the full URL
    const fullUrl = urlOrPath.startsWith('http')
      ? urlOrPath
      : `${this.baseUrl}${urlOrPath}`;

    logger.step(`Navigating to: ${fullUrl}`);

    // "goto" is Playwright's command to open a URL
    // "waitUntil: 'domcontentloaded'" means "wait until the HTML is parsed"
    // (not waiting for images/scripts, which would be 'networkidle' — slower)
    await this.page.goto(fullUrl, { waitUntil: 'domcontentloaded' });

    logger.info(`Page loaded: ${await this.page.title()}`);
  }

  // ==========================================================================
  // METHOD: clickElement
  // ==========================================================================
  // PURPOSE:
  //   Clicks on an element on the page (button, link, checkbox, etc.)
  //
  // WHY NOT JUST USE page.click()?
  //   This wrapper adds:
  //   - Logging (we can see exactly what was clicked in test output)
  //   - Error handling (better error message if element is not found)
  //   - Retry logic (Playwright retries automatically, but we log it)
  //
  // PARAMETERS:
  //   - locator:     A Playwright Locator describing which element to click
  //   - description: A human-readable description for logging (e.g., "Login button")
  // ==========================================================================
  async clickElement(locator: Locator, description: string): Promise<void> {
    logger.step(`Clicking: ${description}`);

    try {
      // Wait for the element to be visible before clicking
      // Playwright auto-waits, but we explicitly wait to get better error messages
      await locator.waitFor({ state: 'visible', timeout: 10000 });

      // Perform the click
      await locator.click();

      logger.info(`Clicked: ${description}`);
    } catch (error) {
      logger.error(`Failed to click: ${description}`, error);
      throw error; // Re-throw so the test knows this step failed
    }
  }

  // ==========================================================================
  // METHOD: fillInputField
  // ==========================================================================
  // PURPOSE:
  //   Types text into an input field (text box, password field, search box, etc.)
  //
  // PARAMETERS:
  //   - locator:     The input field locator
  //   - text:        The text to type into the field
  //   - description: Human-readable name (e.g., "Username field")
  // ==========================================================================
  async fillInputField(locator: Locator, text: string, description: string): Promise<void> {
    logger.step(`Filling "${description}" with: ${text}`);

    try {
      await locator.waitFor({ state: 'visible', timeout: 10000 });

      // "clear()" removes any existing text in the field first
      await locator.clear();

      // "fill()" types the text into the field
      // (More reliable than "type()" which simulates keystrokes one by one)
      await locator.fill(text);

      logger.info(`Filled: ${description}`);
    } catch (error) {
      logger.error(`Failed to fill: ${description}`, error);
      throw error;
    }
  }

  // ==========================================================================
  // METHOD: waitForElement
  // ==========================================================================
  // PURPOSE:
  //   Waits for an element to appear on the page (useful after clicks/navigation
  //   when a new element loads dynamically).
  //
  // PARAMETERS:
  //   - locator:     The element to wait for
  //   - description: Human-readable name for logging
  //   - timeout:     How many milliseconds to wait (default: 10 seconds)
  // ==========================================================================
  async waitForElement(locator: Locator, description: string, timeout: number = 10000): Promise<void> {
    logger.step(`Waiting for: ${description}`);

    try {
      await locator.waitFor({ state: 'visible', timeout });
      logger.info(`Found: ${description}`);
    } catch (error) {
      logger.error(`Timed out waiting for: ${description}`, error);
      throw error;
    }
  }

  // ==========================================================================
  // METHOD: assertElementVisible
  // ==========================================================================
  // PURPOSE:
  //   Checks (asserts) that an element IS visible on the page.
  //   If the element is NOT visible, the test FAILS immediately.
  //
  // WHAT IS AN ASSERTION?
  //   An assertion is a statement that says "I expect X to be true."
  //   If X is NOT true, the test fails with a clear message.
  //   Example: "I expect the welcome banner to be visible after login."
  //   If it's not visible → test fails → we know something is wrong.
  //
  // PARAMETERS:
  //   - locator:     The element to check
  //   - description: What element we're checking (for clear error messages)
  // ==========================================================================
  async assertElementVisible(locator: Locator, description: string): Promise<void> {
    logger.step(`Asserting visible: ${description}`);

    // "expect(...).toBeVisible()" is Playwright's assertion
    // If the element is not visible, Playwright throws an error with a clear message
    await expect(locator).toBeVisible({ timeout: 10000 });

    logger.info(`✅ Visible: ${description}`);
  }

  // ==========================================================================
  // METHOD: assertElementText
  // ==========================================================================
  // PURPOSE:
  //   Checks that an element contains the expected text.
  //
  // PARAMETERS:
  //   - locator:       The element to check
  //   - expectedText:  The text the element should contain
  //   - description:   What element we're checking
  // ==========================================================================
  async assertElementText(locator: Locator, expectedText: string, description: string): Promise<void> {
    logger.step(`Asserting text of "${description}" contains: "${expectedText}"`);

    await expect(locator).toContainText(expectedText, { timeout: 10000 });

    logger.info(`✅ Text verified for: ${description}`);
  }

  // ==========================================================================
  // METHOD: getPageTitle
  // ==========================================================================
  // PURPOSE:
  //   Returns the title of the current page (what you see in the browser tab).
  //   Useful for verifying you navigated to the right page.
  //
  // RETURNS:
  //   The page title as a string (e.g., "Welcome | MyApp")
  // ==========================================================================
  async getPageTitle(): Promise<string> {
    const title = await this.page.title();
    logger.info(`Current page title: "${title}"`);
    return title;
  }

  // ==========================================================================
  // METHOD: getCurrentUrl
  // ==========================================================================
  // PURPOSE:
  //   Returns the current URL in the browser's address bar.
  //   Useful for verifying navigation (e.g., "Did the user get redirected?")
  //
  // RETURNS:
  //   The full URL as a string (e.g., "https://myapp.com/dashboard")
  // ==========================================================================
  getCurrentUrl(): string {
    const url = this.page.url();
    logger.info(`Current URL: ${url}`);
    return url;
  }

  // ==========================================================================
  // METHOD: captureScreenshotOnFailure
  // ==========================================================================
  // PURPOSE:
  //   Takes a screenshot and returns its file path.
  //   Should be called in a test's afterEach hook when a test fails.
  //   The screenshot is later attached as evidence to the XRAY test result.
  //
  // PARAMETERS:
  //   - testName: The name of the test that failed
  //
  // RETURNS:
  //   File path of the screenshot, or null if capture failed.
  // ==========================================================================
  async captureScreenshotOnFailure(testName: string): Promise<string | null> {
    return captureFailureScreenshot(this.page, testName);
  }

  // ==========================================================================
  // METHOD: waitForPageLoad
  // ==========================================================================
  // PURPOSE:
  //   Waits for the browser to finish loading the current page.
  //   Useful after clicking a link or submitting a form.
  //
  // PARAMETERS:
  //   - state: What to wait for:
  //     - 'domcontentloaded': HTML parsed (fastest)
  //     - 'load':             All resources loaded (default)
  //     - 'networkidle':      No network requests for 500ms (slowest, most complete)
  // ==========================================================================
  async waitForPageLoad(state: 'domcontentloaded' | 'load' | 'networkidle' = 'load'): Promise<void> {
    logger.step(`Waiting for page load (state: ${state})`);
    await this.page.waitForLoadState(state);
    logger.info('Page load complete.');
  }

  // ==========================================================================
  // ═══════════════════════════════════════════════════════════════════════════
  //  IFRAME HELPERS — Generic Methods for Working with Iframes
  // ═══════════════════════════════════════════════════════════════════════════
  //
  //  WHY DO WE NEED IFRAME HELPERS?
  //  ─────────────────────────────────────────────────────────────────────────
  //  Many enterprise apps (Salesforce, ServiceNow, Workday) embed parts of
  //  their UI inside <iframe> elements. An iframe is a "page inside a page" —
  //  Playwright CANNOT see elements inside an iframe using normal locators.
  //
  //  You must first "enter" the iframe, then locate elements WITHIN it.
  //  These helper methods make that process simple and reusable.
  //
  //  USAGE PATTERN (in your Page Object):
  //  ─────────────────────────────────────────────────────────────────────────
  //    // 1. Get the iframe by its selector
  //    const frame = this.getIframe('#myIframe');
  //
  //    // 2. Interact with elements INSIDE the iframe
  //    await this.fillInIframe(frame, 'input[name="email"]', 'test@example.com', 'Email field');
  //    await this.clickInIframe(frame, 'button[type="submit"]', 'Submit button');
  //
  //    // 3. Or get a locator inside the iframe for custom assertions
  //    const heading = this.locatorInIframe(frame, 'h1');
  //    await expect(heading).toHaveText('Welcome');
  //
  //  SALESFORCE EXAMPLE:
  //  ─────────────────────────────────────────────────────────────────────────
  //    // Salesforce typically has iframes like:
  //    //   iframe[title="accessibility title"]
  //    //   iframe[name="vfFrameId_xxx"]
  //    //   iframe.cke_wysiwyg_frame  (rich text editors)
  //
  //    const formFrame = this.getIframe('iframe[title="New Lead"]');
  //    await this.fillInIframe(formFrame, '#firstName', 'John', 'First Name');
  //    await this.fillInIframe(formFrame, '#lastName',  'Doe',  'Last Name');
  //    await this.selectInIframe(formFrame, '#status', 'Working', 'Lead Status');
  //
  // ==========================================================================

  // ==========================================================================
  // METHOD: getIframe
  // ==========================================================================
  // PURPOSE:
  //   Returns a FrameLocator for an iframe on the page.
  //   A FrameLocator lets you find and interact with elements INSIDE the iframe.
  //
  // PARAMETERS:
  //   - selector: CSS selector or role-based selector for the iframe element.
  //               Examples: '#myIframe', 'iframe[title="Editor"]',
  //                         'iframe[name="mainFrame"]', 'iframe:nth-child(2)'
  //
  // RETURNS:
  //   A Playwright FrameLocator — use this with the other iframe helper methods.
  //
  // USAGE:
  //   const frame = this.getIframe('iframe#editor');
  //   // Now use frame with fillInIframe(), clickInIframe(), etc.
  // ==========================================================================
  getIframe(selector: string): FrameLocator {
    logger.step(`Entering iframe: ${selector}`);
    return this.page.frameLocator(selector);
  }

  // ==========================================================================
  // METHOD: getNestedIframe
  // ==========================================================================
  // PURPOSE:
  //   Returns a FrameLocator for an iframe INSIDE another iframe.
  //   Some applications (like Salesforce Classic) have nested iframes:
  //     Page → Outer iframe → Inner iframe → Your content
  //
  // PARAMETERS:
  //   - outerSelector: CSS selector for the outer (parent) iframe
  //   - innerSelector: CSS selector for the inner (child) iframe
  //
  // RETURNS:
  //   A FrameLocator pointing to the inner iframe.
  //
  // USAGE:
  //   const innerFrame = this.getNestedIframe('#outerFrame', '#innerFrame');
  //   await this.fillInIframe(innerFrame, '#field', 'value', 'Field name');
  // ==========================================================================
  getNestedIframe(outerSelector: string, innerSelector: string): FrameLocator {
    logger.step(`Entering nested iframe: ${outerSelector} → ${innerSelector}`);
    return this.page.frameLocator(outerSelector).frameLocator(innerSelector);
  }

  // ==========================================================================
  // METHOD: locatorInIframe
  // ==========================================================================
  // PURPOSE:
  //   Returns a Locator for an element INSIDE an iframe.
  //   You can use this locator with any Playwright assertion or action.
  //
  // PARAMETERS:
  //   - frame:    The FrameLocator (from getIframe or getNestedIframe)
  //   - selector: CSS/role selector for the element inside the iframe
  //
  // RETURNS:
  //   A Locator for the element inside the iframe.
  //
  // USAGE:
  //   const frame = this.getIframe('#myFrame');
  //   const heading = this.locatorInIframe(frame, 'h1');
  //   await expect(heading).toHaveText('Welcome');
  // ==========================================================================
  locatorInIframe(frame: FrameLocator, selector: string): Locator {
    return frame.locator(selector);
  }

  // ==========================================================================
  // METHOD: fillInIframe
  // ==========================================================================
  // PURPOSE:
  //   Types text into an input field that lives INSIDE an iframe.
  //   Works exactly like fillInputField() but reaches into the iframe first.
  //
  // PARAMETERS:
  //   - frame:       The FrameLocator (from getIframe)
  //   - selector:    CSS selector for the input field inside the iframe
  //   - text:        The text to type
  //   - description: Human-readable name for logging
  //
  // USAGE:
  //   const frame = this.getIframe('iframe[title="New Lead"]');
  //   await this.fillInIframe(frame, '#firstName', 'John', 'First Name');
  // ==========================================================================
  async fillInIframe(frame: FrameLocator, selector: string, text: string, description: string): Promise<void> {
    logger.step(`[iframe] Filling "${description}" with: ${text}`);
    try {
      const field = frame.locator(selector);
      await field.waitFor({ state: 'visible', timeout: 10000 });
      await field.clear();
      await field.fill(text);
      logger.info(`[iframe] ✅ Filled: ${description}`);
    } catch (error) {
      logger.error(`[iframe] Failed to fill: ${description}`, error);
      throw error;
    }
  }

  // ==========================================================================
  // METHOD: clickInIframe
  // ==========================================================================
  // PURPOSE:
  //   Clicks an element that lives INSIDE an iframe.
  //   Works exactly like clickElement() but reaches into the iframe first.
  //
  // PARAMETERS:
  //   - frame:       The FrameLocator (from getIframe)
  //   - selector:    CSS selector for the element inside the iframe
  //   - description: Human-readable name for logging
  //
  // USAGE:
  //   const frame = this.getIframe('iframe[title="Editor"]');
  //   await this.clickInIframe(frame, 'button.save', 'Save button');
  // ==========================================================================
  async clickInIframe(frame: FrameLocator, selector: string, description: string): Promise<void> {
    logger.step(`[iframe] Clicking: ${description}`);
    try {
      const element = frame.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await element.click();
      logger.info(`[iframe] ✅ Clicked: ${description}`);
    } catch (error) {
      logger.error(`[iframe] Failed to click: ${description}`, error);
      throw error;
    }
  }

  // ==========================================================================
  // METHOD: selectInIframe
  // ==========================================================================
  // PURPOSE:
  //   Selects an option from a <select> dropdown INSIDE an iframe.
  //   Common in Salesforce forms (Lead Status, Industry, etc.)
  //
  // PARAMETERS:
  //   - frame:       The FrameLocator (from getIframe)
  //   - selector:    CSS selector for the <select> element
  //   - value:       The visible text of the option to select
  //   - description: Human-readable name for logging
  //
  // USAGE:
  //   const frame = this.getIframe('iframe[title="New Lead"]');
  //   await this.selectInIframe(frame, '#leadStatus', 'Working', 'Lead Status');
  // ==========================================================================
  async selectInIframe(frame: FrameLocator, selector: string, value: string, description: string): Promise<void> {
    logger.step(`[iframe] Selecting "${value}" in: ${description}`);
    try {
      const dropdown = frame.locator(selector);
      await dropdown.waitFor({ state: 'visible', timeout: 10000 });
      await dropdown.selectOption({ label: value });
      logger.info(`[iframe] ✅ Selected "${value}" in: ${description}`);
    } catch (error) {
      logger.error(`[iframe] Failed to select in: ${description}`, error);
      throw error;
    }
  }

  // ==========================================================================
  // METHOD: assertTextInIframe
  // ==========================================================================
  // PURPOSE:
  //   Verifies that an element inside an iframe contains the expected text.
  //
  // PARAMETERS:
  //   - frame:        The FrameLocator (from getIframe)
  //   - selector:     CSS selector for the element
  //   - expectedText: The text to check for
  //   - description:  Human-readable name for logging
  //
  // USAGE:
  //   const frame = this.getIframe('#editorFrame');
  //   await this.assertTextInIframe(frame, '#body', 'Hello', 'Editor content');
  // ==========================================================================
  async assertTextInIframe(frame: FrameLocator, selector: string, expectedText: string, description: string): Promise<void> {
    logger.step(`[iframe] Asserting "${description}" contains: "${expectedText}"`);
    const element = frame.locator(selector);
    await expect(element).toContainText(expectedText, { timeout: 10000 });
    logger.info(`[iframe] ✅ Text verified: ${description}`);
  }

  // ==========================================================================
  // METHOD: assertVisibleInIframe
  // ==========================================================================
  // PURPOSE:
  //   Verifies that an element inside an iframe is visible.
  //
  // PARAMETERS:
  //   - frame:       The FrameLocator (from getIframe)
  //   - selector:    CSS selector for the element
  //   - description: Human-readable name for logging
  // ==========================================================================
  async assertVisibleInIframe(frame: FrameLocator, selector: string, description: string): Promise<void> {
    logger.step(`[iframe] Asserting visible: ${description}`);
    const element = frame.locator(selector);
    await expect(element).toBeVisible({ timeout: 10000 });
    logger.info(`[iframe] ✅ Visible: ${description}`);
  }

  // ==========================================================================
  // METHOD: typeInIframe
  // ==========================================================================
  // PURPOSE:
  //   Types text into a contenteditable element inside an iframe (e.g., rich
  //   text editors like TinyMCE, CKEditor, Quill — common in Salesforce).
  //   Unlike fill(), type() sends individual keystrokes which works better
  //   for contenteditable divs that don't behave like normal <input> fields.
  //
  // PARAMETERS:
  //   - frame:       The FrameLocator (from getIframe)
  //   - selector:    CSS selector for the contenteditable element
  //   - text:        The text to type
  //   - description: Human-readable name for logging
  //
  // USAGE:
  //   const editorFrame = this.getIframe('iframe.cke_wysiwyg_frame');
  //   await this.typeInIframe(editorFrame, '#tinymce', 'Meeting notes...', 'Rich Text Editor');
  // ==========================================================================
  async typeInIframe(frame: FrameLocator, selector: string, text: string, description: string): Promise<void> {
    logger.step(`[iframe] Typing into "${description}": ${text}`);
    try {
      const element = frame.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await element.click(); // Focus the element first

      // ── Smart clear: works for both <input>/<textarea> AND contenteditable ──
      // fill('') only works on <input>, <textarea>, <select> or [contenteditable].
      // TinyMCE's <body> element sometimes doesn't register as contenteditable
      // to Playwright, so we fall back to keyboard-based clear (Ctrl+A → Delete).
      try {
        await element.fill('');
      } catch {
        // Fallback for rich text / contenteditable body elements
        const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
        await element.press(`${modifier}+a`);
        await element.press('Delete');
      }

      await element.type(text);
      logger.info(`[iframe] ✅ Typed into: ${description}`);
    } catch (error) {
      logger.error(`[iframe] Failed to type into: ${description}`, error);
      throw error;
    }
  }

  // ==========================================================================
  // METHOD: getIframeFieldValue
  // ==========================================================================
  // PURPOSE:
  //   Reads the current value of an input field inside an iframe.
  //   Useful for verifying that a field was filled correctly.
  //
  // PARAMETERS:
  //   - frame:    The FrameLocator
  //   - selector: CSS selector for the input field
  //
  // RETURNS:
  //   The input field's current value as a string.
  // ==========================================================================
  async getIframeFieldValue(frame: FrameLocator, selector: string): Promise<string> {
    return await frame.locator(selector).inputValue();
  }

  // ==========================================================================
  // METHOD: getIframeTextContent
  // ==========================================================================
  // PURPOSE:
  //   Reads the text content of an element inside an iframe (for non-input
  //   elements like <div>, <p>, <span>). Useful for reading rich text editor
  //   content or verifying labels.
  //
  // PARAMETERS:
  //   - frame:    The FrameLocator
  //   - selector: CSS selector for the element
  //
  // RETURNS:
  //   The element's text content as a string.
  // ==========================================================================
  async getIframeTextContent(frame: FrameLocator, selector: string): Promise<string> {
    return (await frame.locator(selector).textContent()) ?? '';
  }
}
