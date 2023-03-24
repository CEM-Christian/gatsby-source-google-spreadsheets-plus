"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guessColumnsDataTypes = void 0;
const camelCase_1 = require("../shared/camelCase");
const filter_1 = require("../shared/filter");
const checkType = (val) => {
    // try to determine type based on the cell value
    if (!val || val === '')
        return 'null';
    // sheets apparently leaves commas in some numbers depending on formatting
    if (val.replace(/-?[,.\d]+/g, '').length === 0 && val !== '')
        return 'number';
    if (val === 'TRUE' || val === 'FALSE')
        return 'boolean';
    return 'string';
};
const rowTypes = (row) => Object.entries(row)
    .filter(([columnName]) => !filter_1.filter.includes(columnName))
    .map(obj => ({ [camelCase_1.camelCase(obj[0])]: checkType(obj[1]) }))
    .reduce((row, cell) => Object.assign(row, cell), {});
function flattenRowTypes(columnTypes, row) {
    Object.entries(row).forEach(([columnName, columnType]) => {
        // skip nulls, they should have no effect
        if (columnType === 'null')
            return;
        const currentTypeCandidate = columnTypes[columnName];
        if (!currentTypeCandidate) {
            // no discovered type yet -> use the one from current item
            columnTypes[columnName] = columnType;
        }
        else if (currentTypeCandidate !== columnType) {
            // previously discovered type is different therefore we fallback to string
            columnTypes[columnName] = 'string';
        }
    });
    return columnTypes;
}
exports.guessColumnsDataTypes = (rows) => rows.map(rowTypes).reduce(flattenRowTypes, {});
