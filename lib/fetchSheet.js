"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cleanRows_1 = require("./fetchSheet/cleanRows");
const get_1 = require("./fetchSheet/get");
const hash_1 = require("./fetchSheet/hash");
exports.default = (spreadsheetId, credentials, apiKey, nestedWorksheets) => __awaiter(void 0, void 0, void 0, function* () {
    const spreadsheet = yield get_1.getSpreadsheet(spreadsheetId, credentials, apiKey);
    const sheets = yield Promise.all(spreadsheet.sheetsByIndex.map((worksheet) => __awaiter(void 0, void 0, void 0, function* () {
        const rows = yield worksheet.getRows({});
        return {
            [worksheet.title]: cleanRows_1.cleanRows(rows).map((row, id) => Object.assign(row, {
                id: hash_1.hash(`${spreadsheetId}-${worksheet.sheetId}-${id}`),
            })),
        };
    })));
    if (nestedWorksheets) {
        return {
            id: hash_1.hash(spreadsheetId),
            title: spreadsheet.title,
            worksheets: sheets.map(sheet => {
                const sheetTitle = Object.keys(sheet)[0]; // First (and only) key of the object is the sheet title
                return {
                    id: hash_1.hash(spreadsheetId + '-' + sheetTitle),
                    title: sheetTitle,
                    rows: sheet[sheetTitle],
                };
            }),
        };
    }
    else {
        return Object.assign({}, ...sheets, {
            id: hash_1.hash(spreadsheetId),
        });
    }
});
