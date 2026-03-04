// =============================================================================
// pages/PlaywrightDevPage.ts — PLAYWRIGHT.DEV SITE PAGE OBJECT
// =============================================================================
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │  📖 FOR NOVICE READERS — WHAT IS THIS FILE?                             │
// │                                                                          │
// │  This is a "Page Object" — a class that represents ONE page (or group   │
// │  of pages) of a website. It bundles together:                            │
// │    1. LOCATORS  — how to find buttons, links, headings on the page      │
// │    2. ACTIONS   — what you can DO on the page (click, navigate, verify) │
// │                                                                          │
// │  WHY?                                                                    │
// │  Instead of writing raw Playwright commands in every test, you write     │
// │  human-readable methods like:                                            │
// │    await playwrightDevPage.clickDocsTab();                               │
// │    await playwrightDevPage.verifyPageTitle('Installation');              │
// │                                                                          │
// │  If the website changes (e.g. a button moves), you fix it HERE once     │
// │  and ALL tests that use this page object keep working.                   │
// │                                                                          │
// │  HOW TO CREATE YOUR OWN PAGE OBJECT:                                     │
// │    1. Create a new file: pages/YourPageName.ts                          │
// │    2. Copy this file as a template                                       │
// │    3. Change the class name, locators, and methods                       │
// │    4. Import it in your test file                                        │
// └──────────────────────────────────────────────────────────────────────────┘
//
// WEBSITE:  https://playwright.dev/
// PAGES:    Home, Docs, API, Community, Python (language switcher)
// =============================================================================

// Import the Playwright Page type (represents one browser tab)
import { type Page, expect } from '@playwright/test';

// Import BasePage — our parent class with common actions (click, fill, navigate, etc.)
import { BasePage } from './BasePage';

// Import the logger so every action appears in terminal + HTML report
import { logger } from '../utils/helpers/logger';

// =============================================================================
// CLASS: PlaywrightDevPage
// =============================================================================
// "extends BasePage" means we INHERIT all common methods from BasePage:
//   navigate(), clickElement(), waitForElement(), assertElementVisible(), etc.
//
// We only need to define:
//   1. Locators SPECIFIC to playwright.dev (navbar links, headings, etc.)
//   2. Methods  SPECIFIC to playwright.dev (clickDocsTab, verifyTitle, etc.)
// =============================================================================
export class PlaywrightDevPage extends BasePage {

  // ==========================================================================
  // LOCATORS — How to Find Elements on playwright.dev
  // ==========================================================================
  //
  // ┌──────────────────────────────────────────────────────────────────────┐
  // │  FOR NOVICES — WHAT IS A LOCATOR?                                   │
  // │                                                                      │
  // │  A locator is like giving someone directions to find something:      │
  // │    "Find the LINK whose text says 'Docs'" → that's a locator.      │
  // │                                                                      │
  // │  Playwright offers several ways to locate elements:                  │
  // │    getByRole('link', { name: 'Docs' })  — finds by semantic role    │
  // │    getByText('Docs')                    — finds by visible text     │
  // │    locator('.navbar__link')             — finds by CSS class        │
  // │                                                                      │
  // │  BEST PRACTICE: Use getByRole() first — it's the most reliable.    │
  // │  Only use CSS selectors as a fallback.                               │
  // └──────────────────────────────────────────────────────────────────────┘
  //
  // "private get" means these are only accessible INSIDE this class.
  // Tests call our METHODS (e.g., clickDocsTab()), not the locators directly.
  // ==========================================================================

  // The main heading (<h1>) on any page — used to verify we're on the right page
  private get mainHeading() {
    return this.page.locator('h1').first();
  }

  // ── NAVBAR LINKS ──
  // These are the top navigation tabs on playwright.dev:
  //   [Docs]  [API]  [Community]  [Node.js ▾ (dropdown)]

  // "Docs" tab in the navbar — links to /docs/intro
  private get docsNavLink() {
    return this.page.getByRole('link', { name: 'Docs', exact: true });
  }

  // "API" tab in the navbar — links to /docs/api/class-playwright
  private get apiNavLink() {
    return this.page.getByRole('link', { name: 'API', exact: true });
  }

  // "Community" tab in the navbar — links to /community/welcome
  private get communityNavLink() {
    return this.page.getByRole('link', { name: 'Community', exact: true });
  }

  // Language dropdown button (shows "Node.js" by default)
  private get languageDropdown() {
    return this.page.locator('.navbar__items').getByRole('button', { name: /Node\.js/i });
  }

  // "Python" option inside the language dropdown
  private get pythonLanguageOption() {
    return this.page.getByRole('link', { name: 'Python', exact: true });
  }

  // ==========================================================================
  // CONSTRUCTOR
  // ==========================================================================
  // ┌──────────────────────────────────────────────────────────────────────┐
  // │  FOR NOVICES — WHAT IS A CONSTRUCTOR?                                │
  // │                                                                      │
  // │  A constructor runs ONCE when you create a new object:               │
  // │    const myPage = new PlaywrightDevPage(page);  // ← constructor    │
  // │                                                                      │
  // │  "super(page)" passes the browser tab to our parent (BasePage)       │
  // │  so BasePage can use it for navigate(), clickElement(), etc.         │
  // └──────────────────────────────────────────────────────────────────────┘
  // ==========================================================================
  constructor(page: Page) {
    super(page);
  }

  // ==========================================================================
  // METHOD: navigateToHomePage
  // ==========================================================================
  //  WHAT IT DOES:  Opens https://playwright.dev/ in the browser
  //  WHEN TO USE:   At the start of every test as the first step
  //
  //  USAGE IN TEST:
  //    const devPage = new PlaywrightDevPage(page);
  //    await devPage.navigateToHomePage();
  // ==========================================================================
  async navigateToHomePage(): Promise<void> {
    logger.section('📂 Navigating to Playwright.dev Homepage');

    // navigate() comes from BasePage — it opens the URL in the browser
    await this.navigate('https://playwright.dev/');

    // Dismiss any cookie banner that might block the navbar
    await this.dismissCookieBanner();

    // Verify the page actually loaded by checking the <h1> heading is visible
    await this.waitForElement(this.mainHeading, 'Homepage main heading');
  }

  // ==========================================================================
  // METHOD: clickDocsTab
  // ==========================================================================
  //  WHAT IT DOES:  Clicks the "Docs" link in the top navbar
  //  RESULT:        Browser navigates to /docs/intro (Installation page)
  //
  //  USAGE IN TEST:
  //    await devPage.clickDocsTab();
  // ==========================================================================
  async clickDocsTab(): Promise<void> {
    // clickElement() comes from BasePage — it waits for the element, then clicks
    await this.clickElement(this.docsNavLink, 'Docs navigation tab');

    // Wait for the new page to finish loading
    await this.waitForPageLoad('domcontentloaded');
  }

  // ==========================================================================
  // METHOD: clickApiTab
  // ==========================================================================
  //  WHAT IT DOES:  Clicks the "API" link in the top navbar
  //  RESULT:        Browser navigates to /docs/api/class-playwright
  //
  //  USAGE IN TEST:
  //    await devPage.clickApiTab();
  // ==========================================================================
  async clickApiTab(): Promise<void> {
    await this.clickElement(this.apiNavLink, 'API navigation tab');
    await this.waitForPageLoad('domcontentloaded');
  }

  // ==========================================================================
  // METHOD: clickCommunityTab
  // ==========================================================================
  //  WHAT IT DOES:  Clicks the "Community" link in the top navbar
  //  RESULT:        Browser navigates to /community/welcome
  //
  //  USAGE IN TEST:
  //    await devPage.clickCommunityTab();
  // ==========================================================================
  async clickCommunityTab(): Promise<void> {
    await this.clickElement(this.communityNavLink, 'Community navigation tab');
    await this.waitForPageLoad('domcontentloaded');
  }

  // ==========================================================================
  // METHOD: switchToPython
  // ==========================================================================
  //  WHAT IT DOES:  Opens the language dropdown and selects "Python"
  //  RESULT:        Browser navigates to /python/ (Python version of the site)
  //
  //  WHY IS THIS DIFFERENT?
  //    The language selector is a DROPDOWN, not a simple link.
  //    We must: 1) Click the dropdown button  2) Then click the "Python" option.
  //
  //  USAGE IN TEST:
  //    await devPage.switchToPython();
  // ==========================================================================
  async switchToPython(): Promise<void> {
    logger.step('Opening language dropdown...');

    // Step 1: Click the "Node.js" dropdown to open the language menu
    await this.clickElement(this.languageDropdown, 'Language dropdown (Node.js)');

    // Step 2: Click the "Python" option inside the dropdown
    await this.clickElement(this.pythonLanguageOption, 'Python language option');

    // Wait for navigation to the Python version of the site
    await this.waitForPageLoad('domcontentloaded');
  }

  // ==========================================================================
  // METHOD: verifyPageTitle
  // ==========================================================================
  //  WHAT IT DOES:  Checks that the browser tab title contains expected text
  //  WHY:           Confirms we navigated to the correct page
  //
  //  PARAMETERS:
  //    - expectedTitle: Text the title should contain (e.g., "Installation")
  //
  //  USAGE IN TEST:
  //    await devPage.verifyPageTitle('Installation');
  // ==========================================================================
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    logger.step(`Verifying page title contains: "${expectedTitle}"`);

    // expect() is Playwright's assertion — if title doesn't match, test FAILS
    await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'), { timeout: 10000 });

    const actualTitle = await this.page.title();
    logger.pass(`✅ Page title verified: "${actualTitle}"`);
  }

  // ==========================================================================
  // METHOD: verifyHeadingText
  // ==========================================================================
  //  WHAT IT DOES:  Checks that the main <h1> heading contains expected text
  //  WHY:           Double-confirms we're on the right page (belt + suspenders)
  //
  //  PARAMETERS:
  //    - expectedText: Text the heading should contain
  //
  //  USAGE IN TEST:
  //    await devPage.verifyHeadingText('Installation');
  // ==========================================================================
  async verifyHeadingText(expectedText: string): Promise<void> {
    logger.step(`Verifying <h1> heading contains: "${expectedText}"`);

    await this.assertElementVisible(this.mainHeading, 'Page main heading');
    await this.assertElementText(this.mainHeading, expectedText, 'Page main heading');
  }

  // ==========================================================================
  // METHOD: verifyUrl
  // ==========================================================================
  //  WHAT IT DOES:  Checks that the current URL contains expected path
  //  WHY:           Another confirmation that navigation worked
  //
  //  PARAMETERS:
  //    - expectedPath: URL path to check for (e.g., "/docs/intro")
  //
  //  USAGE IN TEST:
  //    await devPage.verifyUrl('/docs/intro');
  // ==========================================================================
  async verifyUrl(expectedPath: string): Promise<void> {
    logger.step(`Verifying URL contains: "${expectedPath}"`);

    await expect(this.page).toHaveURL(new RegExp(expectedPath), { timeout: 10000 });

    logger.pass(`✅ URL verified: ${this.page.url()}`);
  }
}
