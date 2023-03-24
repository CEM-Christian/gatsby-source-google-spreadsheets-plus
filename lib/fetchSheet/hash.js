"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = void 0;
const uuid_1 = require("uuid");
const seedConstant = uuid_1.v5('gsheet', '2972963f-2fcf-4567-9237-c09a2b436541');
exports.hash = (str) => uuid_1.v5(str, seedConstant);
