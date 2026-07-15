/**
 * Google Apps Script backend for the Pet Shop Stock + To-Do app.
 * Deploy this as a Web App (Execute as: Me, Who has access: Anyone),
 * then paste the resulting /exec URL into the app's Settings page.
 */

var PRODUCT_HEADERS = ["id", "species", "category", "name", "description", "weightUnit", "unit", "barcode", "qtyPerCase", "quantity", "minStock", "price", "imageUrl"];
var TASK_HEADERS = ["id", "title", "note", "category", "priority", "dueDate", "originalDueDate", "completed", "completedAt", "createdAt"];
var MOVEMENT_HEADERS = ["id", "productId", "type", "amount", "note", "createdAt"];
var TARGET2026_SHEET_NAME = "Target2026";

function doGet(e) {
  var action = (e.parameter && e.parameter.action) || "getAll";
  if (action === "getAll") {
    return jsonResponse_({
      products: readSheet_("Products", PRODUCT_HEADERS),
      tasks: readSheet_("Tasks", TASK_HEADERS),
      movements: readSheet_("Movements", MOVEMENT_HEADERS),
      target2026: readRawTable_(TARGET2026_SHEET_NAME),
    });
  }
  if (action === "getTarget2026") {
    return jsonResponse_({
      target2026: readRawTable_(TARGET2026_SHEET_NAME),
    });
  }
  return jsonResponse_({ error: "unknown action: " + action });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    if (action === "saveAll") {
      writeSheet_("Products", PRODUCT_HEADERS, body.products || []);
      writeSheet_("Tasks", TASK_HEADERS, body.tasks || []);
      writeSheet_("Movements", MOVEMENT_HEADERS, body.movements || []);
      return jsonResponse_({ ok: true });
    }
    return jsonResponse_({ error: "unknown action: " + action });
  } catch (err) {
    return jsonResponse_({ error: String(err) });
  }
}

function getOrCreateSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  return sheet;
}

function getExistingSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name);
}

function readSheet_(name, headers) {
  var sheet = getOrCreateSheet_(name, headers);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values
    .filter(function (row) {
      return row[0] !== "";
    })
    .map(function (row) {
      var obj = {};
      headers.forEach(function (h, i) {
        obj[h] = row[i];
      });
      if ("quantity" in obj) obj.quantity = Number(obj.quantity) || 0;
      if ("minStock" in obj) obj.minStock = Number(obj.minStock) || 0;
      if ("qtyPerCase" in obj) obj.qtyPerCase = Number(obj.qtyPerCase) || 1;
      if ("price" in obj) obj.price = obj.price === "" ? null : Number(obj.price);
      if ("amount" in obj) obj.amount = Number(obj.amount) || 0;
      if ("completed" in obj) {
        obj.completed = obj.completed === true || obj.completed === "TRUE" || obj.completed === "true";
      }
      if ("imageUrl" in obj && obj.imageUrl === "") obj.imageUrl = null;
      if ("completedAt" in obj && obj.completedAt === "") obj.completedAt = null;
      return obj;
    });
}

function readRawTable_(name) {
  var sheet = getExistingSheet_(name);
  if (!sheet || sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    return { headers: [], rows: [] };
  }

  var values = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getDisplayValues();
  var headers = values[0].map(function (header, index) {
    var text = String(header || "").trim();
    return text || "คอลัมน์ " + (index + 1);
  });

  var rows = values.slice(1)
    .filter(function (row) {
      return row.some(function (cell) {
        return cell !== "";
      });
    })
    .map(function (row) {
      var obj = {};
      headers.forEach(function (header, index) {
        obj[header] = row[index] || "";
      });
      return obj;
    });

  return { headers: headers, rows: rows };
}

function writeSheet_(name, headers, rows) {
  var sheet = getOrCreateSheet_(name, headers);
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent();
  }
  if (!rows || rows.length === 0) return;
  var values = rows.map(function (row) {
    return headers.map(function (h) {
      var v = row[h];
      if (v === undefined || v === null) return "";
      return v;
    });
  });
  sheet.getRange(2, 1, values.length, headers.length).setValues(values);
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
