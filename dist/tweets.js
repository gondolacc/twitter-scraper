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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTweet = exports.getLatestTweet = exports.getTweetsByUserId = exports.getTweets = exports.fetchTweets = void 0;
const api_1 = require("./api");
const profile_1 = require("./profile");
const timeline_1 = require("./timeline");
const timeline_async_1 = require("./timeline-async");
function fetchTweets(userId, maxTweets, includeReplies, cursor, auth) {
    return __awaiter(this, void 0, void 0, function* () {
        if (maxTweets > 200) {
            maxTweets = 200;
        }
        const params = new URLSearchParams();
        (0, api_1.addApiParams)(params, includeReplies);
        params.set('count', `${maxTweets}`);
        params.set('userId', userId);
        if (cursor != null && cursor != '') {
            params.set('cursor', cursor);
        }
        const res = yield (0, api_1.requestApi)(`https://api.twitter.com/2/timeline/profile/${userId}.json?${params.toString()}`, auth);
        if (!res.success) {
            throw res.err;
        }
        return (0, timeline_1.parseTweets)(res.value);
    });
}
exports.fetchTweets = fetchTweets;
function getTweets(user, maxTweets, includeReplies, auth) {
    return (0, timeline_async_1.getTweetTimeline)(user, maxTweets, (q, mt, c) => __awaiter(this, void 0, void 0, function* () {
        const userIdRes = yield (0, profile_1.getUserIdByScreenName)(q, auth);
        if (!userIdRes.success) {
            throw userIdRes.err;
        }
        const { value: userId } = userIdRes;
        return fetchTweets(userId, mt, includeReplies, c, auth);
    }));
}
exports.getTweets = getTweets;
function getTweetsByUserId(userId, maxTweets, includeReplies, auth) {
    return (0, timeline_async_1.getTweetTimeline)(userId, maxTweets, (q, mt, c) => {
        return fetchTweets(q, mt, includeReplies, c, auth);
    });
}
exports.getTweetsByUserId = getTweetsByUserId;
function getLatestTweet(user, includeReplies, includeRetweets, auth) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const max = includeRetweets ? 1 : 200;
        const timeline = yield getTweets(user, max, includeReplies, auth);
        if (max == 1) {
            return (yield timeline.next()).value;
        }
        try {
            for (var _d = true, timeline_2 = __asyncValues(timeline), timeline_2_1; timeline_2_1 = yield timeline_2.next(), _a = timeline_2_1.done, !_a; _d = true) {
                _c = timeline_2_1.value;
                _d = false;
                const tweet = _c;
                if (!tweet.isRetweet) {
                    return tweet;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = timeline_2.return)) yield _b.call(timeline_2);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    });
}
exports.getLatestTweet = getLatestTweet;
function getTweet(id, includeReplies, auth) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = new URLSearchParams();
        (0, api_1.addApiParams)(params, includeReplies);
        const res = yield (0, api_1.requestApi)(`https://twitter.com/i/api/2/timeline/conversation/${id}.json?${params.toString()}`, auth);
        if (!res.success) {
            throw res.err;
        }
        const { tweets } = (0, timeline_1.parseTweets)(res.value);
        for (const tweet of tweets) {
            if (tweet.id === id) {
                return tweet;
            }
        }
        return null;
    });
}
exports.getTweet = getTweet;
//# sourceMappingURL=tweets.js.map