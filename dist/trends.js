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
exports.getTrends = void 0;
const api_1 = require("./api");
function getTrends(auth) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    return __awaiter(this, void 0, void 0, function* () {
        const params = new URLSearchParams();
        (0, api_1.addApiParams)(params, false);
        params.set('count', '20');
        params.set('candidate_source', 'trends');
        params.set('include_page_configuration', 'false');
        params.set('entity_tokens', 'false');
        const res = yield (0, api_1.requestApi)(`https://twitter.com/i/api/2/guide.json?${params.toString()}`, auth);
        if (!res.success) {
            throw res.err;
        }
        const instructions = (_b = (_a = res.value.timeline) === null || _a === void 0 ? void 0 : _a.instructions) !== null && _b !== void 0 ? _b : [];
        if (instructions.length < 2) {
            throw new Error('No trend entries found.');
        }
        // Some of this is silly, but for now we're assuming we know nothing about the
        // data, and that anything can be missing. Go has non-nilable strings and empty
        // slices are nil, so it largely doesn't need to worry about this.
        const entries = (_d = (_c = instructions[1].addEntries) === null || _c === void 0 ? void 0 : _c.entries) !== null && _d !== void 0 ? _d : [];
        if (entries.length < 2) {
            throw new Error('No trend entries found.');
        }
        const items = (_g = (_f = (_e = entries[1].content) === null || _e === void 0 ? void 0 : _e.timelineModule) === null || _f === void 0 ? void 0 : _f.items) !== null && _g !== void 0 ? _g : [];
        const trends = [];
        for (const item of items) {
            const trend = (_o = (_m = (_l = (_k = (_j = (_h = item.item) === null || _h === void 0 ? void 0 : _h.clientEventInfo) === null || _j === void 0 ? void 0 : _j.details) === null || _k === void 0 ? void 0 : _k.guideDetails) === null || _l === void 0 ? void 0 : _l.transparentGuideDetails) === null || _m === void 0 ? void 0 : _m.trendMetadata) === null || _o === void 0 ? void 0 : _o.trendName;
            if (trend != null) {
                trends.push(trend);
            }
        }
        return trends;
    });
}
exports.getTrends = getTrends;
//# sourceMappingURL=trends.js.map