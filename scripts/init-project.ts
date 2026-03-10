#!/usr/bin/env npx ts-node
// =============================================================================
// scripts/init-project.ts — PROJECT INITIALIZER FOR NEW CONSUMERS
// =============================================================================
// PURPOSE:
//   When someone clones / receives this framework, they run:
//     npm run init
//
//   This script:
//     1. Copies .env.example → .env  (if .env doesn't exist)
//     2. Creates starter directories if missing
//     3. Creates a sample test + page object if tests/ is empty
//     4. Installs Playwright browsers
//     5. Prints a friendly welcome message
//
// =============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const ROOT = path.resolve(__dirname, '..');

// ─── Helpers ────────────────────────────────────────────────────────────────
function fileExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}
function dirIsEmpty(rel: string): boolean {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return true;
  const entries = fs.readdirSync(p).filter(f => !f.startsWith('.'));
  return entries.length === 0;
}
function ensureDir(rel: string): void {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) { fs.mkdirSync(p, { recursive: true }); }
}
function copyIfMissing(src: string, dest: string): boolean {
  if (!fileExists(dest)) {
    fs.copyFileSync(path.join(ROOT, src), path.join(ROOT, dest));
    return true;
  }
  return false;
}
function writeIfMissing(rel: string, content: string): boolean {
  const p = path.join(ROOT, rel);
  if (fs.existsSync(p)) return false;
  fs.writeFileSync(p, content, 'utf-8');
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════════════
console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║       🚀  Playwright AutoAgent — Project Initializer                     ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

// ── Step 1: .env ─────────────────────────────────────────────────────────
console.log('📋 Step 1: Environment file (.env)');
if (copyIfMissing('.env.example', '.env')) {
  console.log('   ✅ Created .env from .env.example');
  console.log('   ⚠️  IMPORTANT: Open .env and fill in YOUR values!');
} else {
  console.log('   ✅ .env already exists — skipping');
}

// ── Step 2: Ensure directories ──────────────────────────────────────────
console.log('\n📁 Step 2: Ensuring project directories exist');
const dirs = ['tests', 'pages', 'test-data', 'test-fixtures', 'logs', 'reports'];
for (const d of dirs) {
  ensureDir(d);
  console.log(`   ✅ ${d}/`);
}

// ── Step 3: Starter test data YAML ──────────────────────────────────────
console.log('\n📄 Step 3: Starter test data');
const starterYaml = `# ═══════════════════════════════════════════════════════════════════════════
#  YOUR UI TEST DATA — ui-tests.yaml
# ═══════════════════════════════════════════════════════════════════════════
#  Add your PROJ-XXX test cases below. Each test reads from here.
#
#  FLAT (single run):              ONE-TO-MANY (parameterized):
#    PROJ-201:                       PROJ-201:
#      run: yes                        run: yes
#      testCase: "My test"             testCase: "My test"
#      username: "user1"               dataSets:
#      password: "pass1"                 - label: "Admin user"
#                                          username: "admin"
#                                          password: "admin123"
#                                        - label: "Regular user"
#                                          username: "user1"
#                                          password: "pass1"
#
#  Encrypted passwords:
#    password: "\${ENC:U2FsdGVkX1/abc123...}"
#    Generate:  npm run encrypt-password
# ═══════════════════════════════════════════════════════════════════════════

# ── EXAMPLE: Replace with your own tests ──────────────────────────────────
PROJ-201:
  run: yes
  testCase: "TC01: Example login test"
  username: "your-username"
  password: "your-password"
  expectedUrlFragment: "/dashboard"
`;

const starterApiYaml = `# ═══════════════════════════════════════════════════════════════════════════
#  YOUR API TEST DATA — api-tests.yaml
# ═══════════════════════════════════════════════════════════════════════════
#  Same pattern as ui-tests.yaml. Each PROJ-XXX block is one test case.
# ═══════════════════════════════════════════════════════════════════════════

PROJ-301:
  run: yes
  testCase: "TC-API-01: Example GET request"
  baseUrl: "https://jsonplaceholder.typicode.com"
  endpoint: "/posts/1"
  expectedStatus: 200
  expectedFields: ["id", "title", "body"]
`;

if (writeIfMissing('test-data/ui-tests.yaml.starter', starterYaml)) {
  console.log('   ✅ Created test-data/ui-tests.yaml.starter (rename to ui-tests.yaml to use)');
} else {
  console.log('   ✅ Starter YAML already exists — skipping');
}
if (writeIfMissing('test-data/api-tests.yaml.starter', starterApiYaml)) {
  console.log('   ✅ Created test-data/api-tests.yaml.starter');
} else {
  console.log('   ✅ Starter API YAML already exists — skipping');
}

// ── Step 4: Starter Page Object ─────────────────────────────────────────
console.log('\n📄 Step 4: Starter page object');
const starterPage = `// =============================================================================
// pages/MyAppPage.ts — STARTER PAGE OBJECT (replace with your own!)
// =============================================================================
// WHAT IS A PAGE OBJECT?
//   A Page Object encapsulates all the locators and actions for ONE page of
//   your application. Tests call methods like page.login(), page.clickSave()
//   instead of directly interacting with HTML elements.
//
// PATTERN:
//   1. Import BasePage (provides iframe helpers, logger, common utilities)
//   2. Define locators (CSS selectors for your page's elements)
//   3. Define methods (login, fillForm, clickButton, verifyMessage, etc.)
//   4. Export the class so tests can use it
// =============================================================================
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

export class MyAppPage extends BasePage {
  // ── Locators ──────────────────────────────────────────────────────
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton:   Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton   = page.locator('button[type="submit"]');
  }

  // ── Actions ───────────────────────────────────────────────────────
  async navigateTo(url: string): Promise<void> {
    enhancedLogger.step(\`Navigating to: \${url}\`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async login(username: string, password: string): Promise<void> {
    enhancedLogger.step(\`Logging in as: \${username}\`);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyUrl(fragment: string): Promise<void> {
    enhancedLogger.step(\`Verifying URL contains: \${fragment}\`);
    await expect(this.page).toHaveURL(new RegExp(fragment));
  }
}
`;

if (writeIfMissing('pages/MyAppPage.ts.starter', starterPage)) {
  console.log('   ✅ Created pages/MyAppPage.ts.starter (rename & modify for your app)');
} else {
  console.log('   ✅ Starter page object already exists — skipping');
}

// ── Step 5: Starter Test ────────────────────────────────────────────────
console.log('\n📄 Step 5: Starter test file');
const starterTest = `// =============================================================================
// tests/my-app.test.ts — STARTER TEST FILE (replace with your own!)
// =============================================================================
// HOW TO USE:
//   1. Rename this file to describe YOUR test (e.g., checkout.test.ts)
//   2. Update the YAML key (PROJ-201) to match your XRAY test case
//   3. Update the page object import to your own page class
//   4. Write your test steps inside the test() block
//   5. Run:  npx playwright test tests/my-app.test.ts
// =============================================================================
import { test, expect } from '../utils/framework/xray-test-fixture';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';
import { getTestData, getTestDataSets, isTestEnabled } from '../utils/helpers/test-data-loader';

const DATA_FILE = 'ui-tests.yaml';

test.describe('My Application Tests', () => {

  // ── Load data sets for PROJ-201 ──
  const proj201Enabled = isTestEnabled(DATA_FILE, 'PROJ-201');
  const proj201Sets    = getTestDataSets(DATA_FILE, 'PROJ-201');

  for (const ds of proj201Sets) {
    test(
      \`TC01: Example login test [\${ds.label}]\`,
      { annotation: { type: 'xray', description: 'PROJ-201' } },
      async ({ page, xrayTestKey }) => {
        if (!proj201Enabled) test.skip();

        enhancedLogger.section(\`▶ Running: TC01 [\${ds.label}] | XRAY: \${xrayTestKey}\`);

        // Step 1: Navigate to your app
        const baseUrl = process.env['BASE_URL'] || 'https://example.com';
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

        // Step 2: Your test logic here
        // Example:
        //   const myPage = new MyAppPage(page);
        //   await myPage.login(ds.username as string, ds.password as string);
        //   await myPage.verifyUrl(ds.expectedUrlFragment as string);

        enhancedLogger.pass(\`TC01 passed [\${ds.label}]\`, xrayTestKey);
      }
    );
  }
});
`;

if (writeIfMissing('tests/my-app.test.ts.starter', starterTest)) {
  console.log('   ✅ Created tests/my-app.test.ts.starter (rename & modify for your app)');
} else {
  console.log('   ✅ Starter test file already exists — skipping');
}

// ── Step 6: Install Playwright browsers ─────────────────────────────────
console.log('\n🌐 Step 6: Installing Playwright browsers...');
try {
  execSync('npx playwright install', { cwd: ROOT, stdio: 'inherit' });
  console.log('   ✅ Browsers installed');
} catch {
  console.log('   ⚠️  Browser install failed — run manually: npx playwright install');
}

// ── Done! ───────────────────────────────────────────────────────────────
console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║       ✅  Initialization Complete!                                       ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║   NEXT STEPS:                                                            ║
║                                                                          ║
║   1. ✏️  Edit .env — fill in YOUR values:                                ║
║        • JIRA credentials (JIRA_BASE_URL, JIRA_USERNAME, etc.)           ║
║        • BASE_URL (your application URL)                                 ║
║        • ENCRYPTION_KEY (min 16 chars for password encryption)           ║
║                                                                          ║
║   2. 📄 Create your tests:                                              ║
║        • Rename *.starter files (remove .starter extension)              ║
║        • Or write new tests in tests/ folder                             ║
║        • Add test data in test-data/*.yaml                               ║
║                                                                          ║
║   3. 🏃 Run your first test:                                            ║
║        npm test            ← runs all tests                              ║
║        npm run test:headed ← see the browser (recommended first time)    ║
║                                                                          ║
║   4. 📖 Read the docs:                                                  ║
║        GETTING_STARTED.md  ← step-by-step consumer guide                ║
║        WRITE_A_TEST.md     ← how to add your own tests                  ║
║        CAPABILITIES.md     ← full feature list                           ║
║                                                                          ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);
