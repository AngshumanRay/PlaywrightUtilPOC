# ╔═════════════════════════════════════════════════════════════════════════╗
# ║  📋 MANUAL TEST CASES — US-05: Search Functionality                        ║
# ╠═════════════════════════════════════════════════════════════════════════╣
# ║  Generated: 2026-03-13                                                    ║
# ║  Source: user-stories/us-05-*.yaml                              ║
# ║  Total Test Cases: 3                                                    ║
# ║                                                                         ║
# ║  PURPOSE: This document contains manual test cases that can be           ║
# ║  executed by a QA tester WITHOUT any automation. Each test case           ║
# ║  includes preconditions, detailed steps, expected results, and            ║
# ║  test data — ready for manual execution or import into JIRA/TestRail.     ║
# ╚═════════════════════════════════════════════════════════════════════════╝

---

## 📖 User Story

| Field | Detail |
| --- | --- |
| **Story ID** | US-05 |
| **Title** | Search Functionality |
| **Description** | As a user, I want to search for content on the website, so that I can quickly find relevant information without manually browsing. |
| **Priority** | High |
| **Module** | Search |
| **Application URL** | `https://playwright.dev` |
| **Starting Page** | `/docs/intro` |

## ✅ Acceptance Criteria

- [ ] **AC-1** (PROJ-201): Search for a valid keyword and verify results appear
- [ ] **AC-2** (PROJ-202): Search for an empty string should show no results or prompt
- [ ] **AC-3** (PROJ-203): Search for a nonsense keyword should show no results

---

## 📊 Test Case Summary

| # | Test Case ID | XRAY Key | Title | Type | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | TC14 | PROJ-201 | Search for a valid keyword and verify results appear | Positive | High | ⬜ Not Run |
| 2 | TC15 | PROJ-202 | Search for an empty string should show no results or prompt | Negative | Medium | ⬜ Not Run |
| 3 | TC16 | PROJ-203 | Search for a nonsense keyword should show no results | Negative | Medium | ⬜ Not Run |

---

## 🧪 TC14: Search for a valid keyword and verify results appear

### Test Case Details

| Field | Value |
| --- | --- |
| **Test Case ID** | TC14 |
| **XRAY Key** | PROJ-201 |
| **User Story** | US-05 — Search Functionality |
| **Acceptance Criteria** | AC-1 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Search |
| **Created** | 2026-03-13 |
| **Execution Status** | ⬜ Not Run |
| **Assigned To** | — |

### Preconditions

1. Website is accessible
2. Search functionality is available on the page

### Test Steps

| Step # | Action (What to Do) | Expected Result (What Should Happen) | Pass/Fail |
| :---: | --- | --- | :---: |
| 1 | Navigate to the documentation page | Docs page loads with search icon visible | ⬜ |
| 2 | Click the search icon / press Ctrl+K to open search | Search modal opens with input field focused | ⬜ |
| 3 | Type 'locator' into the search field | Search results appear showing matches | ⬜ |
| 4 | Verify at least one result contains the keyword | Results list has items matching 'locator' | ⬜ |

### Test Data

| Data Field | Value | Notes |
| --- | --- | --- |
| searchKeyword | `locator` | Input data |
| expectedMinResults | `1` | Expected result / validation value |
| expectedUrlFragment | `/docs` | Expected result / validation value |

### Execution Result

| Field | Value |
| --- | --- |
| **Status** | ⬜ Not Run |
| **Executed By** | — |
| **Execution Date** | — |
| **Defect ID** | — |
| **Comments** | — |

---

## 🧪 TC15: Search for an empty string should show no results or prompt

### Test Case Details

| Field | Value |
| --- | --- |
| **Test Case ID** | TC15 |
| **XRAY Key** | PROJ-202 |
| **User Story** | US-05 — Search Functionality |
| **Acceptance Criteria** | AC-2 |
| **Type** | Negative |
| **Priority** | Medium |
| **Module** | Search |
| **Created** | 2026-03-13 |
| **Execution Status** | ⬜ Not Run |
| **Assigned To** | — |

### Preconditions

1. Website is accessible
2. Search modal can be opened

### Test Steps

| Step # | Action (What to Do) | Expected Result (What Should Happen) | Pass/Fail |
| :---: | --- | --- | :---: |
| 1 | Navigate to the documentation page | Docs page loads | ⬜ |
| 2 | Open the search modal | Search modal opens | ⬜ |
| 3 | Submit search with empty input | No results shown or a helpful prompt is displayed | ⬜ |

### Test Data

| Data Field | Value | Notes |
| --- | --- | --- |
| searchKeyword | *(empty string)* | Input data |
| expectedMinResults | `0` | Expected result / validation value |
| expectedUrlFragment | `/docs` | Expected result / validation value |

### Execution Result

| Field | Value |
| --- | --- |
| **Status** | ⬜ Not Run |
| **Executed By** | — |
| **Execution Date** | — |
| **Defect ID** | — |
| **Comments** | — |

---

## 🧪 TC16: Search for a nonsense keyword should show no results

### Test Case Details

| Field | Value |
| --- | --- |
| **Test Case ID** | TC16 |
| **XRAY Key** | PROJ-203 |
| **User Story** | US-05 — Search Functionality |
| **Acceptance Criteria** | AC-3 |
| **Type** | Negative |
| **Priority** | Medium |
| **Module** | Search |
| **Created** | 2026-03-13 |
| **Execution Status** | ⬜ Not Run |
| **Assigned To** | — |

### Preconditions

1. Website is accessible

### Test Steps

| Step # | Action (What to Do) | Expected Result (What Should Happen) | Pass/Fail |
| :---: | --- | --- | :---: |
| 1 | Navigate to the documentation page | Docs page loads | ⬜ |
| 2 | Open the search modal | Search modal opens | ⬜ |
| 3 | Type 'xyzzynonexistent99' into the search field | No results found message is displayed | ⬜ |

### Test Data

| Data Field | Value | Notes |
| --- | --- | --- |
| searchKeyword | `xyzzynonexistent99` | Input data |
| expectedMinResults | `0` | Expected result / validation value |
| expectedNoResultsMessage | `No results` | Expected result / validation value |
| expectedUrlFragment | `/docs` | Expected result / validation value |

### Execution Result

| Field | Value |
| --- | --- |
| **Status** | ⬜ Not Run |
| **Executed By** | — |
| **Execution Date** | — |
| **Defect ID** | — |
| **Comments** | — |

---

## 📝 Execution Summary

| Metric | Count |
| --- | --- |
| Total Test Cases | 3 |
| Passed | — |
| Failed | — |
| Blocked | — |
| Not Run | — |

| Field | Value |
| --- | --- |
| **Tested By** | — |
| **Test Date** | — |
| **Environment** | — |
| **Browser** | — |
| **Build / Version** | — |
| **Sign-Off** | — |

---

> 📎 **Traceability**: This test case document was auto-generated from User Story `US-05` (`user-stories/us-05-*.yaml`).
> Automated test scripts are in `tests/search.test.ts` with data from `test-data/search-tests.yaml`.
