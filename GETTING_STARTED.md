# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║           🚀 GETTING STARTED — Playwright AutoAgent                      ║
# ║              A complete guide for NEW consumers of this framework         ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

## 📦 What You Received

This is **Playwright AutoAgent** — a production-ready test automation framework built on top of [Playwright](https://playwright.dev/). It comes pre-configured with:

| Feature | Status | What It Does |
|---|---|---|
| **Playwright Test Runner** | ✅ Built-in | Runs tests in Chromium, Firefox, WebKit |
| **JIRA XRAY Integration** | ✅ Built-in | Auto-uploads PASS/FAIL results to XRAY |
| **Data-Driven Testing** | ✅ Built-in | Tests read from YAML files, parameterized |
| **Password Encryption** | ✅ Built-in | AES-256 encryption for sensitive YAML values |
| **HTML Execution Reports** | ✅ Built-in | Professional charts + per-test detail |
| **API Testing** | ✅ Built-in | GET/POST/PUT/DELETE with timing |
| **Iframe Handling** | ✅ Built-in | Generic helpers for Salesforce-style iframes |
| **Accessibility Scans** | ✅ Built-in | axe-core auto-runs after every UI test |
| **Database Utilities** | ⚪ Optional | Postgres/MySQL — enable in `.env` |
| **Email Verification** | ⚪ Optional | Mailosaur/MailSlurp — enable in `.env` |

---

## 🏁 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Initialize the Project

```bash
npm run init
```

This creates your `.env` file, starter templates, and installs browsers.

### Step 3: Configure Your Environment

Open `.env` and fill in **YOUR** values:

```bash
# ─── REQUIRED ───────────────────────────────────────────
BASE_URL=https://your-app.com              # Your application URL
ENCRYPTION_KEY=YourSecretKey16charsMin     # For encrypted passwords

# ─── OPTIONAL (fill these to enable JIRA XRAY) ─────────
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=your-api-token
XRAY_PROJECT_KEY=PROJ
```

### Step 4: Run the Demo Tests

```bash
npm test                    # Run all tests (headless)
npm run test:headed         # See the browser (recommended first time!)
```

### Step 5: Write Your Own Tests

See [WRITE_A_TEST.md](./WRITE_A_TEST.md) for the complete guide, or follow the quick recipe below.

---

## 🗂️ What Files You Should Touch

### ✏️ Files You EDIT (your layer)

| File/Folder | What You Do |
|---|---|
| `.env` | Fill in YOUR credentials, URLs, keys |
| `test-data/*.yaml` | Add YOUR test data (inputs, expected values) |
| `tests/*.test.ts` | Write YOUR test cases |
| `pages/*Page.ts` | Create YOUR page objects (extend `BasePage`) |
| `test-fixtures/` | Add YOUR HTML fixtures (for iframe tests) |

### 🔒 Files You DON'T Touch (framework layer)

| File/Folder | Why |
|---|---|
| `utils/` | Framework engine — logger, XRAY, data loader, encryption |
| `pages/BasePage.ts` | Generic iframe & page helpers |
| `config/` | Environment resolution logic |
| `playwright.config.ts` | Pre-configured (reads from `.env`) |
| `scripts/` | Init & utility scripts |

---

## 📝 Adding Your First Test — Quick Recipe

### 1. Add Test Data to YAML

```yaml
# test-data/ui-tests.yaml
PROJ-201:
  run: yes
  testCase: "TC01: Login to My App"
  username: "admin"
  password: "${ENC:U2FsdGVkX1/abc123...}"  # encrypted — see below
  expectedUrlFragment: "/dashboard"
```

### 2. Create a Page Object

```typescript
// pages/MyAppPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

export class MyAppPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton:   Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton   = page.locator('button[type="submit"]');
  }

  async login(username: string, password: string): Promise<void> {
    enhancedLogger.step(`Logging in as: ${username}`);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
```

### 3. Write the Test

```typescript
// tests/my-app.test.ts
import { test, expect } from '../utils/framework/xray-test-fixture';
import { MyAppPage } from '../pages/MyAppPage';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';
import { getTestDataSets, isTestEnabled } from '../utils/helpers/test-data-loader';

const DATA_FILE = 'ui-tests.yaml';

test.describe('My App Tests', () => {
  const proj201Enabled = isTestEnabled(DATA_FILE, 'PROJ-201');
  const proj201Sets    = getTestDataSets(DATA_FILE, 'PROJ-201');

  for (const ds of proj201Sets) {
    test(`TC01: Login [${ds.label}]`,
      { annotation: { type: 'xray', description: 'PROJ-201' } },
      async ({ page, xrayTestKey }) => {
        if (!proj201Enabled) test.skip();

        const myPage = new MyAppPage(page);
        await page.goto(process.env['BASE_URL']!);
        await myPage.login(ds.username as string, ds.password as string);
        await expect(page).toHaveURL(new RegExp(ds.expectedUrlFragment as string));

        enhancedLogger.pass(`TC01 passed [${ds.label}]`, xrayTestKey);
      }
    );
  }
});
```

### 4. Run It

```bash
npx playwright test tests/my-app.test.ts --headed
```

---

## 🔐 Encrypting Passwords

Never store plain-text passwords in YAML. Use encryption:

```bash
npm run encrypt-password
```

1. Enter your password when prompted
2. Copy the encrypted output
3. Paste into YAML:

```yaml
password: "${ENC:U2FsdGVkX1+8pM4itdDObuWaI5BrUJdIigtiBsHo04X2b7HWHZkibsti7BKnUAjA}"
```

The framework auto-decrypts at runtime using `ENCRYPTION_KEY` from `.env`.

---

## 📊 One-to-Many Data-Driven Testing

Run the SAME test with MULTIPLE data sets:

```yaml
PROJ-201:
  run: yes
  testCase: "TC01: Login"
  dataSets:
    - label: "Admin user"
      username: "admin"
      password: "${ENC:...}"
      expectedUrlFragment: "/admin/dashboard"
    - label: "Regular user"
      username: "user1"
      password: "${ENC:...}"
      expectedUrlFragment: "/dashboard"
    - label: "Read-only user"
      username: "viewer"
      password: "${ENC:...}"
      expectedUrlFragment: "/dashboard"
```

This runs TC01 **three times** — once per data set. Test names show:
- `TC01: Login [Admin user]`
- `TC01: Login [Regular user]`
- `TC01: Login [Read-only user]`

---

## 🔧 Enabling Optional Features

### JIRA XRAY (auto-upload results to JIRA)

Fill these in `.env`:

```bash
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=your-api-token
XRAY_PROJECT_KEY=PROJ
XRAY_TEST_SET_ID=PROJ-456
```

### Database (test data seeding/cleanup)

```bash
DB_ENABLED=true
DB_HOST=localhost
DB_PORT=5432
DB_NAME=test_db
DB_USER=test_user
DB_PASSWORD=test_pass
```

### Email Verification (OTP/confirmation emails)

```bash
EMAIL_ENABLED=true
EMAIL_SERVICE=mailosaur
EMAIL_API_KEY=your-api-key
EMAIL_SERVER_ID=your-server-id
```

### Custom Timeouts

```bash
TEST_TIMEOUT=60000        # Max time per test (ms)
EXPECT_TIMEOUT=10000      # Max time per assertion (ms)
ACTION_TIMEOUT=10000      # Max time per click/fill (ms)
NAVIGATION_TIMEOUT=30000  # Max time for page.goto() (ms)
```

### Browser Viewport

```bash
VIEWPORT_WIDTH=1920       # Desktop HD
VIEWPORT_HEIGHT=1080
```

---

## 📂 Project Structure Map

```
📦 playwright-autoagent/
│
├── 🔒 FRAMEWORK (don't modify) ──────────────────────────
│   ├── utils/
│   │   ├── framework/          ← Test fixture, global setup/teardown
│   │   ├── helpers/            ← Logger, data-loader, screenshot
│   │   ├── api/                ← REST API helpers (GET/POST/PUT/DELETE)
│   │   ├── jira-xray/          ← JIRA XRAY integration
│   │   ├── security/           ← AES-256 encryption
│   │   ├── database/           ← DB connection helpers
│   │   ├── email/              ← Email verification
│   │   ├── reporting/          ← HTML report generator
│   └── index.ts            ← Barrel exports
│   ├── pages/BasePage.ts       ← Generic iframe & page helpers
│   ├── config/environment.ts   ← Multi-env resolver
│   ├── playwright.config.ts    ← Pre-configured (reads .env)
│   ├── tsconfig.json           ← TypeScript config
│   └── scripts/
│       ├── init-project.ts          ← Initializer script
│       └── generate-from-stories.ts  ← Auto-generator: Stories → TCs → Scripts → Manual QA docs
│
├── ✏️  YOUR CODE (modify these) ───────────────────────
│   ├── .env                    ← Your secrets & configuration
│   ├── test-data/
│   │   ├── ui-tests.yaml       ← Your UI test data
│   │   └── api-tests.yaml      ← Your API test data
│   ├── user-stories/           ← Your user story YAML files (input for generator)
│   │   ├── _TEMPLATE.yaml      ← Copy this to create a new story
│   │   └── US-05-search.yaml   ← Sample story
│   ├── tests/
│   │   ├── my-app.test.ts      ← Your test cases
│   │   └── ...more tests...
│   ├── pages/
│   │   ├── MyAppPage.ts        ← Your page objects
│   │   └── ...more pages...
│   └── test-fixtures/          ← Your HTML fixtures
│
├── 📊 AUTO-GENERATED (gitignored) ───────────────────────
│   ├── reports/                ← HTML execution reports
│   ├── logs/                   ← Daily rotating log files
│   ├── test-results/           ← Playwright screenshots/videos
│   ├── playwright-report/      ← Playwright HTML report
│   └── manual-test-cases/      ← Auto-generated manual QA test case documents
│
└── 📖 DOCUMENTATION ─────────────────────────
    ├── GETTING_STARTED.md      ← You are here!
    ├── WRITE_A_TEST.md         ← How to add tests
    ├── CAPABILITIES.md         ← Full feature list
    ├── TEST_CASES.md           ← User Stories → Test Cases traceability
    ├── GENERATE_TESTS_FROM_STORIES.md ← Auto-generation pipeline guide
    ├── README.md               ← Overview
    └── WALKTHROUGH.md          ← Architecture walkthrough
```

---

## 🚀 npm Scripts Reference

| Command | What It Does |
|---|---|
| `npm run init` | Initialize project (creates `.env`, installs browsers) |
| `npm test` | Run all tests (headless) |
| `npm run test:headed` | Run all tests with visible browser |
| `npm run test:login` | Run only login tests |
| `npm run test:api` | Run only API tests |
| `npm run test:nav` | Run only navigation tests |
| `npm run test:iframe` | Run only iframe tests |
| `npm run test:debug` | Run with Playwright Inspector (step-by-step) |
| `npm run test:ui` | Run with Playwright UI mode (visual) |
| `npm run test:chromium` | Run on Chromium only |
| `npm run test:firefox` | Run on Firefox only |
| `npm run test:webkit` | Run on WebKit (Safari) only |
| `npm run test:parallel` | Run with 4 parallel workers |
| `npm run test:single` | Run sequentially (1 worker) |
| `npm run test:report` | Open last Playwright HTML report |
| `npm run encrypt-password` | Encrypt a password for YAML |
| `npm run lint` | Type-check all TypeScript |
| `npm run generate` | Full auto-generation pipeline (Stories → YAML + scripts + pages + TEST_CASES.md + manual TCs) |
| `npm run generate:tc` | Generate test cases + YAML data only |
| `npm run generate:scripts` | Generate test scripts + page objects only |
| `npm run generate:manual` | Generate standalone manual QA test case documents only |

---

## 🆘 Troubleshooting

| Problem | Solution |
|---|---|
| `Cannot find module` | Run `npm install` |
| `Browsers not installed` | Run `npx playwright install` |
| `.env not found` | Run `npm run init` or copy `.env.example` to `.env` |
| `ENCRYPTION_KEY not set` | Add `ENCRYPTION_KEY=YourKey16chars+` to `.env` |
| `XRAY skipped` | Fill JIRA credentials in `.env` (or ignore if not using XRAY) |
| Tests timeout | Increase `TEST_TIMEOUT` in `.env` |
| Headed mode not working | Use `npm run test:headed` |

---

## 📋 Checklist: Before Your First Run

- [ ] `npm install` completed
- [ ] `npm run init` completed
- [ ] `.env` filled with YOUR values (at minimum: `BASE_URL`, `ENCRYPTION_KEY`)
- [ ] Test data added to `test-data/*.yaml`
- [ ] At least one test file in `tests/`
- [ ] Run `npm run test:headed` to see it work!

---

*Built with ❤️ by Playwright AutoAgent*
