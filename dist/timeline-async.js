"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTweetTimeline = exports.getUserTimeline = void 0;
function getUserTimeline(query, maxProfiles, fetchFunc) {
    return __asyncGenerator(this, arguments, function* getUserTimeline_1() {
        let nProfiles = 0;
        let cursor = undefined;
        while (nProfiles < maxProfiles) {
            const batch = yield __await(fetchFunc(query, maxProfiles, cursor));
            const { profiles, next } = batch;
            if (profiles.length === 0) {
                break;
            }
            for (const profile of profiles) {
                if (nProfiles < maxProfiles) {
                    cursor = next;
                    yield yield __await(profile);
                }
                else {
                    break;
                }
                nProfiles++;
            }
        }
    });
}
exports.getUserTimeline = getUserTimeline;
function getTweetTimeline(query, maxTweets, fetchFunc) {
    return __asyncGenerator(this, arguments, function* getTweetTimeline_1() {
        let nTweets = 0;
        let cursor = undefined;
        while (nTweets < maxTweets) {
            const batch = yield __await(fetchFunc(query, maxTweets, cursor));
            const { tweets, next } = batch;
            if (tweets.length === 0) {
                break;
            }
            for (const tweet of tweets) {
                if (nTweets < maxTweets) {
                    cursor = next;
                    yield yield __await(tweet);
                }
                else {
                    break;
                }
                nTweets++;
            }
        }
    });
}
exports.getTweetTimeline = getTweetTimeline;
//# sourceMappingURL=timeline-async.js.map