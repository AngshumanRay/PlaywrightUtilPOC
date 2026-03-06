// =============================================================================
// tests/api.test.ts — API TEST SUITE (3 Sample API Tests)
// =============================================================================
// PURPOSE:
//   These tests validate REST API endpoints DIRECTLY — no browser needed.
//   They run much faster than UI tests (milliseconds vs seconds) and are
//   perfect for verifying your backend is working correctly.
//
// WHAT IS API TESTING?
//   Instead of clicking buttons in a browser, API tests send HTTP requests
//   (GET, POST, PUT, DELETE) directly to the server and check the response.
//
//   Example:
//     UI Test:  Open browser → go to /users → see "John Doe" on screen
//     API Test: GET /api/users/1 → check JSON response has { name: "John Doe" }
//
//   API tests are faster, more reliable, and test the backend independently
//   of the frontend. Every professional team runs both UI + API tests.
//
// PUBLIC API USED FOR DEMO:
//   https://jsonplaceholder.typicode.com — a free fake REST API used by
//   millions of developers worldwide for testing. It mimics a real application
//   with users, posts, comments, todos, etc.
//
// TEST OVERVIEW:
//   ✅ TC04 (PROJ-104): GET /posts/1 — Fetch a blog post and validate fields
//   ✅ TC05 (PROJ-105): POST /posts — Create a new post and verify 201 Created
//   ✅ TC06 (PROJ-106): GET /users/1 — Fetch a user profile and validate fields
//
// HOW XRAY WORKS IN API TESTS:
//   Same as UI tests — the annotation maps each test to a JIRA/XRAY test case.
//   API tests don't use a browser page, but they still get:
//   - ✅ PASS/FAIL results uploaded to XRAY
//   - ⏱️  Duration measured automatically
//   - 📊 Results in the HTML execution report
//
// HOW TO RUN:
//   npm test                           → runs ALL tests (UI + API)
//   npx playwright test tests/api.test.ts  → runs ONLY API tests
// =============================================================================

// Import our custom test fixture (provides xrayTestKey + auto result upload)
import { test, expect } from './xray-test-fixture';

// Import the API helper functions
import { apiGet, apiPost } from '../utils/api/api-helper';

// Import enhanced logger so all API steps appear in the HTML report
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

// Import the data-driven test data loader (reads from YAML files)
import { getTestData, isTestEnabled } from '../utils/helpers/test-data-loader';

// =============================================================================
// TEST DATA — DATA-DRIVEN (loaded from test-data/api-tests.yaml)
// =============================================================================
// All test inputs (endpoints, payloads, expected values) are stored EXTERNALLY:
//   test-data/api-tests.yaml
//
// Each test reads its data using getTestData('api-tests.yaml', 'PROJ-XXX').
// Data fields are accessed directly: td.baseUrl, td.endpoint, etc.
// To skip a test, set  run: no  next to the PROJ-XXX key in the YAML file.
// =============================================================================
const DATA_FILE = 'api-tests.yaml';

// =============================================================================
// TEST GROUP: API Feature Tests
// =============================================================================
test.describe('API Feature Tests', () => {

  // ==========================================================================
  // TEST 4: GET a blog post and validate its structure
  // ==========================================================================
  // WHAT THIS TEST DOES:
  //   Sends a GET request to /posts/1 and checks:
  //     - HTTP status is 200 (OK)
  //     - Response body has the expected fields (id, userId, title, body)
  //     - The post ID matches what we requested (id === 1)
  //     - The title is a non-empty string
  //
  // WHY THIS MATTERS:
  //   Every time you fetch data, you should verify:
  //   1. The server responded (status 200)
  //   2. The data has the right shape (no missing fields)
  //   3. The values make sense (id matches, strings aren't empty)
  //
  // XRAY MAPPING: PROJ-104
  // ==========================================================================
  test(
    'TC04: GET /posts/1 — Should return a valid blog post with correct fields',
    {
      annotation: { type: 'xray', description: 'PROJ-104' },
    },
    async ({ xrayTestKey }) => {
      // ── Load test data from YAML (data-driven) ──
      const td = getTestData(DATA_FILE, 'PROJ-104');

      // ── Skip if run: no in YAML ──
      if (!isTestEnabled(DATA_FILE, 'PROJ-104')) test.skip();

      const baseUrl = td.baseUrl as string;
      const endpoint = td.endpoint as string;
      const expectedStatus = td.expectedStatus as number;
      const expectedFields = td.expectedFields as string[];
      const expectedId = td.expectedId as number;

      enhancedLogger.section(`▶ Running Test: ${td.testCase} | XRAY: ${xrayTestKey}`);
      enhancedLogger.info(`📂 Test data loaded from ${DATA_FILE} for ${xrayTestKey}`, xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 1: Send GET request to fetch post #1
      // -----------------------------------------------------------------------
      enhancedLogger.step(`Step 1: Send GET request to ${endpoint}`, xrayTestKey);

      const response = await apiGet<Record<string, unknown>>(`${baseUrl}${endpoint}`);

      enhancedLogger.info(
        `Response received — Status: ${response.status}, Duration: ${response.durationMs}ms`,
        xrayTestKey
      );

      // -----------------------------------------------------------------------
      // STEP 2: Validate HTTP status code
      // -----------------------------------------------------------------------
      enhancedLogger.step(`Step 2: Validate HTTP status is ${expectedStatus}`, xrayTestKey);
      expect(response.status).toBe(expectedStatus);
      expect(response.success).toBe(true);
      enhancedLogger.info(`✅ Status ${expectedStatus} confirmed`, xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 3: Validate response body has all required fields
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 3: Validate response body structure', xrayTestKey);
      expect(response.data).not.toBeNull();
      for (const field of expectedFields) {
        expect(response.data).toHaveProperty(field);
      }
      enhancedLogger.info(`✅ All required fields present: ${expectedFields.join(', ')}`, xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 4: Validate field values are correct
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 4: Validate field values are correct', xrayTestKey);
      expect(response.data!['id']).toBe(expectedId);
      expect(typeof response.data!['title']).toBe('string');
      expect((response.data!['title'] as string).length).toBeGreaterThan(0);
      expect(typeof response.data!['body']).toBe('string');
      expect((response.data!['body'] as string).length).toBeGreaterThan(0);

      enhancedLogger.info(`✅ Post ID: ${response.data!['id']}`, xrayTestKey);
      enhancedLogger.info(`✅ Post Title: "${response.data!['title']}"`, xrayTestKey);
      enhancedLogger.pass(`TC04 passed — GET ${endpoint} returned valid post (${response.durationMs}ms)`, xrayTestKey);
    }
  );

  // ==========================================================================
  // TEST 5: POST to create a new resource and verify 201 Created
  // ==========================================================================
  // WHAT THIS TEST DOES:
  //   Sends a POST request to /posts with a JSON body and checks:
  //     - HTTP status is 201 (Created) — NOT 200 (OK)
  //     - The server echoes back the data we sent
  //     - A new "id" is assigned to the created resource
  //
  // WHY 201 AND NOT 200?
  //   HTTP status codes tell you WHAT happened:
  //     200 OK        → Request worked, here's existing data
  //     201 Created   → Resource was CREATED successfully
  //     400 Bad Req   → You sent bad data
  //     401 Unauth    → You need to log in
  //     404 Not Found → Resource doesn't exist
  //     500 Server Err→ The server crashed
  //   A well-designed API returns 201 when you POST new data.
  //
  // XRAY MAPPING: PROJ-105
  // ==========================================================================
  test(
    'TC05: POST /posts — Should create a new post and return 201 Created',
    {
      annotation: { type: 'xray', description: 'PROJ-105' },
    },
    async ({ xrayTestKey }) => {
      // ── Load test data from YAML (data-driven) ──
      const td = getTestData(DATA_FILE, 'PROJ-105');

      // ── Skip if run: no in YAML ──
      if (!isTestEnabled(DATA_FILE, 'PROJ-105')) test.skip();

      const baseUrl = td.baseUrl as string;
      const endpoint = td.endpoint as string;
      const expectedStatus = td.expectedStatus as number;
      const payload = {
        title:  td.payloadTitle as string,
        body:   td.payloadBody as string,
        userId: td.payloadUserId as number,
      };

      enhancedLogger.section(`▶ Running Test: ${td.testCase} | XRAY: ${xrayTestKey}`);
      enhancedLogger.info(`📂 Test data loaded from ${DATA_FILE} for ${xrayTestKey}`, xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 1: Prepare the request payload (from YAML)
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 1: Prepare new post payload', xrayTestKey);
      enhancedLogger.info(`Sending payload: ${JSON.stringify(payload)}`, xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 2: Send POST request
      // -----------------------------------------------------------------------
      enhancedLogger.step(`Step 2: Send POST request to ${endpoint}`, xrayTestKey);

      const response = await apiPost<{
        id:     number;
        title:  string;
        body:   string;
        userId: number;
      }>(`${baseUrl}${endpoint}`, payload);

      enhancedLogger.info(
        `Response received — Status: ${response.status}, Duration: ${response.durationMs}ms`,
        xrayTestKey
      );

      // -----------------------------------------------------------------------
      // STEP 3: Validate status is 201 Created
      // -----------------------------------------------------------------------
      enhancedLogger.step(`Step 3: Validate HTTP status is ${expectedStatus} Created`, xrayTestKey);
      expect(response.status).toBe(expectedStatus);
      expect(response.success).toBe(true);
      enhancedLogger.info(`✅ Status ${expectedStatus} Created confirmed`, xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 4: Validate the server echoed back our data + assigned an ID
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 4: Validate server echoed data and assigned new ID', xrayTestKey);
      expect(response.data).not.toBeNull();
      expect(response.data!.title).toBe(payload['title']);
      expect(response.data!.body).toBe(payload['body']);
      expect(response.data!.userId).toBe(payload['userId']);
      expect(response.data!.id).toBeGreaterThan(0); // Server assigned a new ID

      enhancedLogger.info(`✅ Post created with ID: ${response.data!.id}`, xrayTestKey);
      enhancedLogger.info(`✅ Title echoed back: "${response.data!.title}"`, xrayTestKey);
      enhancedLogger.pass(`TC05 passed — POST ${endpoint} returned ${expectedStatus} Created with id=${response.data!.id} (${response.durationMs}ms)`, xrayTestKey);
    }
  );

  // ==========================================================================
  // TEST 6: GET user profile and validate all key fields
  // ==========================================================================
  // WHAT THIS TEST DOES:
  //   Sends a GET request to /users/1 and checks:
  //     - HTTP status is 200 (OK)
  //     - User has id, name, email, phone, website, address, company
  //     - Email format looks valid (contains "@")
  //     - Nested objects (address, company) have their own fields
  //
  // WHY VALIDATE NESTED OBJECTS?
  //   Real APIs often return nested data:
  //     { name: "John", address: { city: "New York", zip: "10001" } }
  //   You should verify nested fields too — not just top-level ones.
  //
  // XRAY MAPPING: PROJ-106
  // ==========================================================================
  test(
    'TC06: GET /users/1 — Should return a complete user profile with nested fields',
    {
      annotation: { type: 'xray', description: 'PROJ-106' },
    },
    async ({ xrayTestKey }) => {
      // ── Load test data from YAML (data-driven) ──
      const td = getTestData(DATA_FILE, 'PROJ-106');

      // ── Skip if run: no in YAML ──
      if (!isTestEnabled(DATA_FILE, 'PROJ-106')) test.skip();

      const baseUrl = td.baseUrl as string;
      const endpoint = td.endpoint as string;
      const expectedStatus = td.expectedStatus as number;
      const expectedFields = td.expectedFields as string[];
      const expectedId = td.expectedId as number;
      const emailContains = td.emailContains as string;
      const addressFields = td.addressFields as string[];
      const companyFields = td.companyFields as string[];

      enhancedLogger.section(`▶ Running Test: ${td.testCase} | XRAY: ${xrayTestKey}`);
      enhancedLogger.info(`📂 Test data loaded from ${DATA_FILE} for ${xrayTestKey}`, xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 1: Send GET request to fetch user #1
      // -----------------------------------------------------------------------
      enhancedLogger.step(`Step 1: Send GET request to ${endpoint}`, xrayTestKey);

      const response = await apiGet<Record<string, unknown>>(`${baseUrl}${endpoint}`);

      enhancedLogger.info(
        `Response received — Status: ${response.status}, Duration: ${response.durationMs}ms`,
        xrayTestKey
      );

      // -----------------------------------------------------------------------
      // STEP 2: Validate status
      // -----------------------------------------------------------------------
      enhancedLogger.step(`Step 2: Validate HTTP status is ${expectedStatus}`, xrayTestKey);
      expect(response.status).toBe(expectedStatus);
      expect(response.success).toBe(true);
      enhancedLogger.info(`✅ Status ${expectedStatus} OK confirmed`, xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 3: Validate top-level user fields
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 3: Validate top-level user fields', xrayTestKey);
      expect(response.data).not.toBeNull();

      const user = response.data!;
      expect(user['id']).toBe(expectedId);

      for (const field of expectedFields) {
        expect(user).toHaveProperty(field);
      }

      // Email format check
      if (emailContains) {
        expect(user['email'] as string).toContain(emailContains);
      }

      enhancedLogger.info(`✅ User ID:    ${user['id']}`, xrayTestKey);
      enhancedLogger.info(`✅ User Name:  ${user['name']}`, xrayTestKey);
      enhancedLogger.info(`✅ Email:      ${user['email']}`, xrayTestKey);
      enhancedLogger.info(`✅ Phone:      ${user['phone']}`, xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 4: Validate nested objects (address and company from YAML)
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 4: Validate nested address object', xrayTestKey);
      const addressObj = user['address'] as Record<string, unknown>;
      for (const child of addressFields) {
        expect(addressObj).toHaveProperty(child);
      }
      enhancedLogger.info(`✅ address fields validated: ${addressFields.join(', ')}`, xrayTestKey);

      enhancedLogger.step('Step 5: Validate nested company object', xrayTestKey);
      const companyObj = user['company'] as Record<string, unknown>;
      for (const child of companyFields) {
        expect(companyObj).toHaveProperty(child);
      }
      enhancedLogger.info(`✅ company fields validated: ${companyFields.join(', ')}`, xrayTestKey);

      enhancedLogger.pass(`TC06 passed — GET ${endpoint} returned full user profile (${response.durationMs}ms)`, xrayTestKey);
    }
  );

});
