"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camelCase = void 0;
function camelCase(str) {
    const input = str.trim();
    if (input.length === 0)
        return '';
    if (input.length === 1)
        return input.toLowerCase();
    return (input.charAt(0).toLowerCase() + input.slice(1))
        .replace(/^[_.\- ]+/, '')
        .replace(/[_.\- ]+(\w|$)/g, (_, p1) => p1.toUpperCase())
        .replace(/\d+(\w|$)/g, m => m.toUpperCase());
}
exports.camelCase = camelCase;
