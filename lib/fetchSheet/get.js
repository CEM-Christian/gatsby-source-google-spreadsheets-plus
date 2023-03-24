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
exports.getSpreadsheet = void 0;
const google_spreadsheet_1 = require("google-spreadsheet");
function getSpreadsheet(spreadsheetId, credentials, apiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const doc = new google_spreadsheet_1.GoogleSpreadsheet(spreadsheetId);
        if (credentials) {
            yield doc.useServiceAccountAuth(credentials);
        }
        else if (apiKey) {
            doc.useApiKey(apiKey);
        }
        else {
            throw new Error('Authentication not provided. Either provided google service account credentials or an APIKey');
        }
        yield doc.loadInfo();
        return doc;
    });
}
exports.getSpreadsheet = getSpreadsheet;
