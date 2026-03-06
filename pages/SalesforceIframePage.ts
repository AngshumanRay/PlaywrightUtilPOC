// =============================================================================
// pages/SalesforceIframePage.ts — SALESFORCE-STYLE IFRAME PAGE OBJECT
// =============================================================================
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │  📖 WHAT IS THIS FILE?                                                   │
// │                                                                          │
// │  This is a Page Object for testing applications that use IFRAMES —       │
// │  like Salesforce, ServiceNow, Workday, or any enterprise app.            │
// │                                                                          │
// │  WHY IFRAMES ARE TRICKY:                                                 │
// │    An <iframe> is a "page inside a page." Playwright cannot see          │
// │    elements inside an iframe using normal page.locator() calls.          │
// │    You must first "enter" the iframe using page.frameLocator().          │
// │                                                                          │
// │  SALESFORCE IFRAME PATTERN:                                              │
// │    Salesforce Classic and Lightning both use iframes heavily:             │
// │    ┌─────────────────────────────────────────────────────────────┐       │
// │    │  Main Page                                                   │       │
// │    │  ┌──────────────────────────────────────────────────────┐    │       │
// │    │  │  iframe (form fields: First Name, Last Name, etc.)   │    │       │
// │    │  └──────────────────────────────────────────────────────┘    │       │
// │    │  ┌──────────────────────────────────────────────────────┐    │       │
// │    │  │  iframe (rich text editor: Description / Notes)      │    │       │
// │    │  └──────────────────────────────────────────────────────┘    │       │
// │    └─────────────────────────────────────────────────────────────┘       │
// │                                                                          │
// │  THIS PAGE OBJECT DEMONSTRATES:                                          │
// │    ✅ Entering a single iframe with multiple form fields                 │
// │    ✅ Entering a rich text editor iframe (TinyMCE / CKEditor)           │
// │    ✅ Reading and verifying content inside iframes                       │
// │    ✅ All methods are inherited from BasePage's generic iframe helpers   │
// │                                                                          │
// │  DEMO SITE USED:                                                         │
// │    https://the-internet.herokuapp.com/iframe                             │
// │    This page has a TinyMCE rich text editor inside an iframe —           │
// │    exactly the same pattern Salesforce uses for Description fields.      │
// │                                                                          │
// │  HOW TO ADAPT THIS FOR YOUR SALESFORCE ORG:                              │
// │    1. Change the iframe selectors to match your Salesforce page          │
// │    2. Add locators for your specific form fields                         │
// │    3. The iframe helpers from BasePage work with ANY iframe              │
// └──────────────────────────────────────────────────────────────────────────┘
//
// =============================================================================

import { type Page, type FrameLocator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/helpers/logger';

// =============================================================================
// CLASS: SalesforceIframePage
// =============================================================================
// Demonstrates the IFRAME HANDLING pattern for Salesforce-style applications.
//
// INHERITS from BasePage:
//   ✅ getIframe()         — enter an iframe by CSS selector
//   ✅ getNestedIframe()   — enter an iframe inside another iframe
//   ✅ fillInIframe()      — type into an input field inside an iframe
//   ✅ clickInIframe()     — click a button/link inside an iframe
//   ✅ selectInIframe()    — pick a dropdown option inside an iframe
//   ✅ typeInIframe()      — type into a rich text editor inside an iframe
//   ✅ assertTextInIframe()    — verify text inside an iframe
//   ✅ assertVisibleInIframe() — verify element visibility inside an iframe
//   ✅ getIframeFieldValue()   — read an input field's value inside an iframe
//   ✅ getIframeTextContent()  — read text content inside an iframe
// =============================================================================
export class SalesforceIframePage extends BasePage {

  // ==========================================================================
  // IFRAME SELECTORS
  // ==========================================================================
  // In Salesforce, iframes typically look like:
  //   <iframe title="accessibility title" name="vfFrameId_xxx" ...>
  //   <iframe class="cke_wysiwyg_frame" ...>
  //
  // For our demo site (the-internet.herokuapp.com/iframe), the iframe is:
  //   <iframe id="mce_0_ifr">
  //
  // Change these selectors to match YOUR application's iframes.
  // ==========================================================================

  /** The rich text editor iframe (TinyMCE on the demo site) */
  private readonly EDITOR_IFRAME_SELECTOR = 'iframe#mce_0_ifr';

  /** The contenteditable body inside the rich text editor iframe */
  private readonly EDITOR_BODY_SELECTOR = '#tinymce';

  // ==========================================================================
  // PAGE-LEVEL LOCATORS (elements OUTSIDE iframes, on the main page)
  // ==========================================================================

  /** The main page heading */
  private get pageHeading() {
    return this.page.locator('h3');
  }

  /** The "File" menu in the TinyMCE toolbar (outside the iframe) */
  private get fileMenuButton() {
    return this.page.locator('button[role="menuitem"]:has-text("File")');
  }

  /** The "Edit" menu in the TinyMCE toolbar (outside the iframe) */
  private get editMenuButton() {
    return this.page.locator('button[role="menuitem"]:has-text("Edit")');
  }

  // ==========================================================================
  // NAVIGATION
  // ==========================================================================

  /**
   * Navigate to the iframe demo page.
   * In a real Salesforce project, this would navigate to the Lead/Contact form.
   */
  async navigateToIframePage(): Promise<void> {
    logger.section('📂 Navigating to Iframe Demo Page');
    await this.navigate('https://the-internet.herokuapp.com/iframe');
    await this.waitForElement(this.pageHeading, 'Page heading');
  }

  // ==========================================================================
  // IFRAME ACTIONS — Rich Text Editor
  // ==========================================================================
  // These methods demonstrate working with a rich text editor inside an iframe.
  // In Salesforce, this pattern applies to:
  //   - Description fields on Leads, Contacts, Cases, Opportunities
  //   - Notes and Attachments
  //   - Email composer
  //   - Custom rich text formula fields
  // ==========================================================================

  /**
   * Get the rich text editor iframe.
   * Returns a FrameLocator you can pass to any BasePage iframe helper.
   */
  getEditorIframe(): FrameLocator {
    return this.getIframe(this.EDITOR_IFRAME_SELECTOR);
  }

  /**
   * Clear the rich text editor and type new content.
   *
   * @param content  The text to type into the editor
   */
  async typeInEditor(content: string): Promise<void> {
    const editorFrame = this.getEditorIframe();
    await this.typeInIframe(editorFrame, this.EDITOR_BODY_SELECTOR, content, 'Rich Text Editor');
  }

  /**
   * Read the current content of the rich text editor.
   *
   * @returns The text content inside the editor
   */
  async getEditorContent(): Promise<string> {
    const editorFrame = this.getEditorIframe();
    return await this.getIframeTextContent(editorFrame, this.EDITOR_BODY_SELECTOR);
  }

  /**
   * Verify that the editor contains the expected text.
   *
   * @param expectedText  The text that should appear in the editor
   */
  async verifyEditorContent(expectedText: string): Promise<void> {
    const editorFrame = this.getEditorIframe();
    await this.assertTextInIframe(editorFrame, this.EDITOR_BODY_SELECTOR, expectedText, 'Rich Text Editor content');
  }

  /**
   * Verify that the editor body is visible inside the iframe.
   */
  async verifyEditorIsVisible(): Promise<void> {
    const editorFrame = this.getEditorIframe();
    await this.assertVisibleInIframe(editorFrame, this.EDITOR_BODY_SELECTOR, 'Rich Text Editor body');
  }

  // ==========================================================================
  // TOOLBAR ACTIONS (outside the iframe — on the main page)
  // ==========================================================================
  // The TinyMCE toolbar buttons (Bold, Italic, etc.) are OUTSIDE the iframe,
  // on the main page. This mirrors Salesforce where toolbar controls are on
  // the main page but the text content is inside an iframe.
  // ==========================================================================

  /**
   * Click the "File" menu in the editor toolbar.
   */
  async clickFileMenu(): Promise<void> {
    await this.clickElement(this.fileMenuButton, '"File" toolbar menu');
  }

  /**
   * Click the "Edit" menu in the editor toolbar.
   */
  async clickEditMenu(): Promise<void> {
    await this.clickElement(this.editMenuButton, '"Edit" toolbar menu');
  }

  /**
   * Verify the page heading text.
   *
   * @param expectedText  Expected heading text
   */
  async verifyPageHeading(expectedText: string): Promise<void> {
    await this.assertElementText(this.pageHeading, expectedText, 'Page heading');
  }

  // ==========================================================================
  //  ★ SALESFORCE-STYLE MULTI-FIELD IFRAME EXAMPLE
  // ==========================================================================
  //  The methods below show the PATTERN for a Salesforce form with multiple
  //  fields inside a SINGLE iframe. Even though the demo site only has a
  //  rich text editor, these methods demonstrate exactly how you would
  //  write a Salesforce Lead/Contact/Opportunity form page object.
  //
  //  HOW TO ADAPT FOR YOUR SALESFORCE ORG:
  //  ─────────────────────────────────────────────────────────────────────
  //  1. Find your iframe selector:
  //       Open DevTools → find the <iframe> wrapping your form
  //       Use: 'iframe[title="Your Page Title"]' or 'iframe[name="xxx"]'
  //
  //  2. Find field selectors inside the iframe:
  //       Right-click the field → Inspect → note the id/name/placeholder
  //       Use: '#firstName', 'input[name="Company"]', '[placeholder="..."]'
  //
  //  3. Call the BasePage helpers:
  //       const frame = this.getIframe('iframe[title="New Lead"]');
  //       await this.fillInIframe(frame, '#firstName', 'John', 'First Name');
  //
  //  EXAMPLE — A complete Salesforce Lead form (uncomment and adapt):
  //  ─────────────────────────────────────────────────────────────────────
  //
  //  private readonly LEAD_IFRAME = 'iframe[title="New Lead"]';
  //
  //  async fillLeadForm(data: Record<string, string>): Promise<void> {
  //    const frame = this.getIframe(this.LEAD_IFRAME);
  //
  //    // Text fields
  //    if (data.firstName)  await this.fillInIframe(frame, '#firstName',  data.firstName,  'First Name');
  //    if (data.lastName)   await this.fillInIframe(frame, '#lastName',   data.lastName,   'Last Name');
  //    if (data.company)    await this.fillInIframe(frame, '#company',    data.company,    'Company');
  //    if (data.email)      await this.fillInIframe(frame, '#email',      data.email,      'Email');
  //    if (data.phone)      await this.fillInIframe(frame, '#phone',      data.phone,      'Phone');
  //
  //    // Dropdown fields
  //    if (data.leadStatus) await this.selectInIframe(frame, '#leadStatus', data.leadStatus, 'Lead Status');
  //    if (data.industry)   await this.selectInIframe(frame, '#industry',   data.industry,   'Industry');
  //
  //    // Rich text description (separate iframe inside the form iframe)
  //    if (data.description) {
  //      const descFrame = this.getNestedIframe(this.LEAD_IFRAME, 'iframe.cke_wysiwyg_frame');
  //      await this.typeInIframe(descFrame, 'body', data.description, 'Description');
  //    }
  //  }
  //
  //  async verifyLeadCreated(expectedName: string): Promise<void> {
  //    const frame = this.getIframe(this.LEAD_IFRAME);
  //    await this.assertTextInIframe(frame, '.successMessage', expectedName, 'Success message');
  //  }
  //
  // ==========================================================================

  /**
   * Fill multiple fields inside an iframe in one call.
   *
   * This is a convenience method that takes a map of { selector → value }
   * and fills each field. Perfect for Salesforce forms with many fields.
   *
   * @param frame    The FrameLocator for the iframe containing the fields
   * @param fields   Map of CSS selector → value to fill
   *                 Example: { '#firstName': 'John', '#lastName': 'Doe' }
   *
   * USAGE:
   *   const frame = this.getIframe('iframe[title="New Lead"]');
   *   await this.fillMultipleFieldsInIframe(frame, {
   *     '#firstName': 'John',
   *     '#lastName':  'Doe',
   *     '#company':   'Acme Corp',
   *     '#email':     'john@acme.com',
   *   });
   */
  async fillMultipleFieldsInIframe(frame: FrameLocator, fields: Record<string, string>): Promise<void> {
    logger.section('📋 Filling multiple fields inside iframe');
    for (const [selector, value] of Object.entries(fields)) {
      // Generate a readable name from the selector: '#firstName' → 'firstName'
      const fieldName = selector.replace(/^[#.\[]/, '').replace(/["\]]/g, '').split('=').pop() || selector;
      await this.fillInIframe(frame, selector, value, fieldName);
    }
    logger.info(`✅ All ${Object.keys(fields).length} fields filled`);
  }

  /**
   * Verify multiple field values inside an iframe.
   *
   * @param frame    The FrameLocator
   * @param expected Map of CSS selector → expected value
   */
  async verifyMultipleFieldsInIframe(frame: FrameLocator, expected: Record<string, string>): Promise<void> {
    logger.section('🔍 Verifying multiple field values inside iframe');
    for (const [selector, expectedValue] of Object.entries(expected)) {
      const actualValue = await this.getIframeFieldValue(frame, selector);
      logger.info(`  ${selector}: "${actualValue}" (expected: "${expectedValue}")`);
      if (actualValue !== expectedValue) {
        throw new Error(`Field ${selector}: expected "${expectedValue}" but got "${actualValue}"`);
      }
    }
    logger.info(`✅ All ${Object.keys(expected).length} field values verified`);
  }
}
