"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanRows = void 0;
const camelCase_1 = require("./shared/camelCase");
const filter_1 = require("./shared/filter");
const columnsDataTypes_1 = require("./cleanRows/columnsDataTypes");
exports.cleanRows = (rows) => {
    const columnTypes = columnsDataTypes_1.guessColumnsDataTypes(rows);
    return rows.map(row => Object.entries(row)
        .filter(([columnName]) => !filter_1.filter.includes(columnName))
        .map(obj => {
        const key = camelCase_1.camelCase(obj[0]);
        return {
            [key]: convertCell(columnTypes, key, obj[1]),
        };
    })
        .reduce((row, cell) => Object.assign(row, cell), {}));
};
function convertCell(columnTypes, key, val) {
    switch (columnTypes[key]) {
        case 'number':
            return isNull(val) ? null : Number(val.replace(/,/g, ''));
        case 'boolean':
            // when column contains null we return false, otherwise check boolean value
            return isNull(val) ? false : val === 'TRUE';
        default:
            // We cast all possible null types to actually be null
            return isNull(val) ? null : val;
    }
}
function isNull(val) {
    return val === null || val === undefined || val === '';
}
