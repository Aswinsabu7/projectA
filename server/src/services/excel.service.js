const ExcelJS = require('exceljs');
const { Subscriber } = require('../models');
const subscriberService = require('./subscriber.service');
const { PLATFORM } = require('../constants/roles');

const TEMPLATE_HEADERS = ['Name', 'Mobile Number', 'Email', 'Platform', 'Start Date', 'End Date', 'Amount Paid'];

/**
 * Generates an .xlsx template buffer with the expected import headers and one sample row.
 */
async function generateTemplateBuffer() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Subscribers');

  sheet.columns = TEMPLATE_HEADERS.map((header) => ({ header, key: header, width: 20 }));
  sheet.addRow({
    Name: 'John Doe',
    'Mobile Number': '9876543210',
    Email: 'john@example.com',
    Platform: 'YouTube',
    'Start Date': '2025-01-01',
    'End Date': '2025-02-01',
    'Amount Paid': 499,
  });
  sheet.getRow(1).font = { bold: true };

  return workbook.xlsx.writeBuffer();
}

/**
 * Parses an uploaded .xlsx/.xls buffer into an array of plain row objects keyed by header.
 */
async function parseWorkbookBuffer(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1);
  const headers = [];
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = String(cell.value ?? '').trim();
  });

  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (!header) return;
      let value = cell.value;
      if (value && typeof value === 'object' && value.text) value = value.text; // rich text
      if (value && typeof value === 'object' && value.result !== undefined) value = value.result; // formula
      obj[header] = value ?? '';
    });
    if (Object.values(obj).some((v) => String(v).trim() !== '')) rows.push(obj);
  });

  return rows;
}

function normalizeDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Validates each row of the parsed excel data, checking required fields, formats,
 * and duplicate detection (both within the file and against existing DB records).
 * Returns { validRows, invalidRows } used for the "preview before import" step.
 */
async function validateRows(rows) {
  const existingMobiles = new Set(
    (await Subscriber.find({ isDeleted: false }).select('mobileNumber').lean()).map((s) => s.mobileNumber)
  );
  const seenInFile = new Set();

  const validRows = [];
  const invalidRows = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // account for header row
    const errors = [];

    const fullName = String(row['Name'] || '').trim();
    const mobileNumber = String(row['Mobile Number'] || '').trim();
    const email = String(row['Email'] || '').trim();
    const platform = String(row['Platform'] || '').trim();
    const startDate = normalizeDate(row['Start Date']);
    const endDate = normalizeDate(row['End Date']);
    const amountPaid = Number(row['Amount Paid']);

    if (!fullName) errors.push('Name is required');
    if (!mobileNumber || !/^[0-9+\-\s]{7,15}$/.test(mobileNumber)) errors.push('Invalid mobile number');
    if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.push('Invalid email');
    if (!Object.values(PLATFORM).includes(platform)) errors.push('Platform must be Instagram or YouTube');
    if (!startDate) errors.push('Invalid start date');
    if (!endDate) errors.push('Invalid end date');
    if (startDate && endDate && endDate <= startDate) errors.push('End date must be after start date');
    if (Number.isNaN(amountPaid) || amountPaid < 0) errors.push('Invalid amount paid');

    if (mobileNumber && existingMobiles.has(mobileNumber)) errors.push('Duplicate: mobile number already exists in system');
    if (mobileNumber && seenInFile.has(mobileNumber)) errors.push('Duplicate: mobile number repeated in file');
    seenInFile.add(mobileNumber);

    const record = {
      rowNumber,
      fullName,
      mobileNumber,
      email,
      platform,
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      amountPaid,
    };

    if (errors.length) {
      invalidRows.push({ ...record, errors });
    } else {
      validRows.push(record);
    }
  });

  return { validRows, invalidRows, totalRows: rows.length };
}

/**
 * Bulk inserts previously validated rows (typically the confirmed subset from the preview step).
 */
async function bulkImport(rows, createdBy) {
  const docs = [];
  for (const row of rows) {
    const subscriberId = await subscriberService.nextSubscriberId();
    docs.push({
      subscriberId,
      fullName: row.fullName,
      mobileNumber: row.mobileNumber,
      email: row.email || '',
      platform: row.platform,
      subscriptionStartDate: row.subscriptionStartDate,
      subscriptionEndDate: row.subscriptionEndDate,
      amountPaid: row.amountPaid,
      remarks: row.remarks || '',
      createdBy,
    });
  }
  const inserted = await Subscriber.insertMany(docs, { ordered: false });
  return inserted;
}

/**
 * Builds an .xlsx buffer for exporting the given subscriber rows (array of plain objects).
 */
async function generateExportBuffer(rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Subscribers');

  const headers = [
    'Subscriber ID',
    'Name',
    'Mobile Number',
    'Email',
    'Platform',
    'Start Date',
    'End Date',
    'Amount Paid',
    'Status',
    'Remarks',
  ];
  sheet.columns = headers.map((header) => ({ header, key: header, width: 18 }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  return workbook.xlsx.writeBuffer();
}

module.exports = {
  TEMPLATE_HEADERS,
  generateTemplateBuffer,
  parseWorkbookBuffer,
  validateRows,
  bulkImport,
  generateExportBuffer,
};
