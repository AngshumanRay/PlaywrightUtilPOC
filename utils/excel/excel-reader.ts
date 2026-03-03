// =============================================================================
// utils/excel/excel-reader.ts — EXCEL TO JSON CONVERTER
// =============================================================================
// PURPOSE:
//   Reads Excel (.xlsx / .xls / .csv) files and converts each row into a
//   JavaScript object. This powers DATA-DRIVEN testing — one Excel row = one
//   test scenario, so non-technical people can add test cases in Excel.
//
// WHAT IS DATA-DRIVEN TESTING?
//   Normally a test is hardcoded with ONE set of data:
//     test('login', () => { loginWith('alice', 'pass123'); });
//
//   With data-driven testing, you put all data in Excel and the test loops
//   through every row automatically:
//     Row 1: alice  / pass123  → expects: success
//     Row 2: bob    / wrong    → expects: error
//     Row 3: (empty)/ pass456  → expects: error
//
//   The same test code runs 3 times with different inputs. This means:
//     - 0 code changes to add new test scenarios
//     - Business analysts can write test data without touching code
//     - Easy to add 100 rows for edge cases
//
// HOW TO USE:
//   // Read all rows from Sheet1
//   const testData = readExcelSheet('data/login-data.xlsx');
//
//   // Use in a test
//   for (const row of testData) {
//     // row.username, row.password, row.expectedResult are available
//   }
//
// EXCEL FORMAT EXPECTED:
//   Row 1 = Column HEADERS (used as property names)
//   Row 2+ = Data rows (each becomes one object)
//
//   Example:
//   | username | password    | expectedResult | xrayKey  |
//   |----------|-------------|----------------|----------|
//   | alice    | pass123     | success        | PROJ-101 |
//   | bob      | wrongpass   | error          | PROJ-102 |
// =============================================================================

import * as XLSX from 'xlsx';   // The Excel reading library
import * as path from 'path';   // For building file paths correctly
import * as fs   from 'fs';     // For checking if files exist
import { logger } from '../helpers/logger';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * ONE ROW from an Excel sheet, represented as a key-value object.
 * Keys come from the header row. Values are always strings.
 *
 * Example:
 *   { username: 'alice', password: 'pass123', expectedResult: 'success' }
 */
export type ExcelRow = Record<string, string>;

/**
 * Options you can pass to customise how Excel is read.
 */
export interface ExcelReadOptions {
  /** Sheet name to read (default: first sheet in the file) */
  sheetName?: string;

  /** Skip rows where ALL cells are empty (default: true) */
  skipEmptyRows?: boolean;

  /** Which column number the headers start at (0-indexed, default: 0 = column A) */
  headerRow?: number;
}

// =============================================================================
// FUNCTION: readExcelSheet
// =============================================================================
/**
 * Reads an Excel file and returns all data rows as an array of objects.
 *
 * @param filePath - Relative or absolute path to the .xlsx file
 *                   Example: 'data/login-data.xlsx'
 * @param options  - Optional customisations (sheet name, skip empty rows)
 * @returns        Array of objects — one per data row
 *
 * EXAMPLE:
 *   const rows = readExcelSheet('data/login-data.xlsx');
 *   // rows[0] = { username: 'alice', password: 'pass123', expectedResult: 'success' }
 */
export function readExcelSheet(filePath: string, options: ExcelReadOptions = {}): ExcelRow[] {
  // Build the absolute path (handles both relative paths like 'data/x.xlsx'
  // and absolute paths like '/home/user/data/x.xlsx')
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  // -------------------------------------------------------------------------
  // CHECK: Does the file exist?
  // -------------------------------------------------------------------------
  if (!fs.existsSync(absolutePath)) {
    logger.error(`❌ Excel file not found: ${absolutePath}`);
    logger.error(`   Please make sure the file exists before running tests.`);
    throw new Error(`Excel file not found: ${absolutePath}`);
  }

  logger.info(`📊 Reading Excel file: ${absolutePath}`);

  // -------------------------------------------------------------------------
  // READ THE EXCEL FILE
  // -------------------------------------------------------------------------
  // XLSX.readFile reads the binary Excel format and parses it into an
  // in-memory "workbook" object that we can navigate programmatically.
  const workbook = XLSX.readFile(absolutePath, {
    type:     'file',
    cellDates: true,   // Parse dates as JavaScript Date objects (not serial numbers)
  });

  // -------------------------------------------------------------------------
  // SELECT THE SHEET
  // -------------------------------------------------------------------------
  // A workbook can have multiple sheets (tabs).
  // We either use the sheet name specified in options, or the first sheet.
  const sheetName = options.sheetName ?? workbook.SheetNames[0];

  if (!workbook.SheetNames.includes(sheetName)) {
    const available = workbook.SheetNames.join(', ');
    logger.error(`❌ Sheet "${sheetName}" not found in workbook.`);
    logger.error(`   Available sheets: ${available}`);
    throw new Error(`Sheet "${sheetName}" not found. Available sheets: ${available}`);
  }

  const sheet = workbook.Sheets[sheetName];
  logger.info(`   Sheet: "${sheetName}"`);

  // -------------------------------------------------------------------------
  // CONVERT TO ARRAY OF OBJECTS
  // -------------------------------------------------------------------------
  // XLSX.utils.sheet_to_json converts the sheet grid into an array of objects.
  // Each object's keys are taken from the FIRST ROW (header row).
  // Each object's values are the corresponding cell values.
  //
  // { header: 1 } means: first row = headers, rest = data
  // { defval: '' } means: empty cells become empty string '' not undefined
  const rawRows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
    header:    (options.headerRow !== undefined) ? options.headerRow : undefined,
    defval:    '',
    raw:       false,   // Convert numbers/dates to strings for consistency
  });

  // -------------------------------------------------------------------------
  // FILTER EMPTY ROWS (optional, default: true)
  // -------------------------------------------------------------------------
  // Skip any rows where all values are empty strings.
  // This prevents phantom test cases from blank Excel rows.
  const shouldSkipEmpty = options.skipEmptyRows !== false;

  const filteredRows = shouldSkipEmpty
    ? rawRows.filter(row => Object.values(row).some(v => String(v).trim() !== ''))
    : rawRows;

  // Convert all values to strings (Excel might return numbers for numeric cells)
  const normalizedRows: ExcelRow[] = filteredRows.map(row => {
    const normalized: ExcelRow = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[String(key).trim()] = String(value ?? '').trim();
    }
    return normalized;
  });

  logger.pass(`✅ Loaded ${normalizedRows.length} row(s) from Excel sheet "${sheetName}"`);
  return normalizedRows;
}

// =============================================================================
// FUNCTION: readExcelAllSheets
// =============================================================================
/**
 * Reads ALL sheets from an Excel file.
 * Returns a map of { sheetName → rows[] }.
 *
 * Useful when you have one Excel file with multiple test scenario sheets.
 * Example: login-tests.xlsx with sheets: "ValidLogin", "InvalidLogin", "EdgeCases"
 *
 * @param filePath - Path to the Excel file
 * @returns Object mapping sheet names to their row arrays
 *
 * EXAMPLE:
 *   const allSheets = readExcelAllSheets('data/all-tests.xlsx');
 *   const loginRows = allSheets['LoginTests'];
 */
export function readExcelAllSheets(filePath: string): Record<string, ExcelRow[]> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Excel file not found: ${absolutePath}`);
  }

  const workbook = XLSX.readFile(absolutePath, { cellDates: true });
  const result: Record<string, ExcelRow[]> = {};

  for (const sheetName of workbook.SheetNames) {
    result[sheetName] = readExcelSheet(filePath, { sheetName });
  }

  logger.info(`📊 Loaded ${workbook.SheetNames.length} sheet(s) from: ${path.basename(absolutePath)}`);
  return result;
}

// =============================================================================
// FUNCTION: getExcelSheetNames
// =============================================================================
/**
 * Returns a list of all sheet names in an Excel file.
 * Useful to check what sheets are available before reading.
 *
 * @param filePath - Path to the Excel file
 * @returns Array of sheet name strings
 */
export function getExcelSheetNames(filePath: string): string[] {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Excel file not found: ${absolutePath}`);
  }

  const workbook = XLSX.readFile(absolutePath);
  return workbook.SheetNames;
}

// =============================================================================
// FUNCTION: writeExcelResults
// =============================================================================
/**
 * Writes test results back to an Excel file.
 * Useful for updating the "Result" column in your test data spreadsheet
 * after the test run.
 *
 * @param filePath - Path where the Excel file will be saved (created if needed)
 * @param data     - Array of objects to write (column headers = object keys)
 * @param sheetName - Sheet name to write to (default: 'TestResults')
 *
 * EXAMPLE:
 *   writeExcelResults('test-results/results.xlsx', [
 *     { testCase: 'TC01', status: 'PASS', duration: '2.3s', xrayKey: 'PROJ-101' },
 *     { testCase: 'TC02', status: 'FAIL', duration: '1.1s', xrayKey: 'PROJ-102' },
 *   ]);
 */
export function writeExcelResults(
  filePath: string,
  data: Record<string, string | number | boolean>[],
  sheetName = 'TestResults'
): void {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  // Create directory if it doesn't exist
  const dir = path.dirname(absolutePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const workbook  = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, absolutePath);

  logger.pass(`✅ Results written to Excel: ${absolutePath}`);
}
