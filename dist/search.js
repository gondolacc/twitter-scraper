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
exports.fetchSearchProfiles = exports.fetchSearchTweets = exports.searchProfiles = exports.searchTweets = exports.SearchMode = void 0;
const api_1 = require("./api");
const timeline_1 = require("./timeline");
const timeline_async_1 = require("./timeline-async");
/**
 * The categories that can be used in Twitter searches.
 */
var SearchMode;
(function (SearchMode) {
    SearchMode[SearchMode["Top"] = 0] = "Top";
    SearchMode[SearchMode["Latest"] = 1] = "Latest";
    SearchMode[SearchMode["Photos"] = 2] = "Photos";
    SearchMode[SearchMode["Videos"] = 3] = "Videos";
    SearchMode[SearchMode["Users"] = 4] = "Users";
})(SearchMode || (exports.SearchMode = SearchMode = {}));
function searchTweets(query, maxTweets, includeReplies, searchMode, auth) {
    return (0, timeline_async_1.getTweetTimeline)(query, maxTweets, (q, mt, c) => {
        return fetchSearchTweets(q, mt, includeReplies, searchMode, auth, c);
    });
}
exports.searchTweets = searchTweets;
function searchProfiles(query, maxProfiles, auth) {
    return (0, timeline_async_1.getUserTimeline)(query, maxProfiles, (q, mt, c) => {
        return fetchSearchProfiles(q, mt, auth, c);
    });
}
exports.searchProfiles = searchProfiles;
function fetchSearchTweets(query, maxTweets, includeReplies, searchMode, auth, cursor) {
    return __awaiter(this, void 0, void 0, function* () {
        const timeline = yield getSearchTimeline(query, maxTweets, includeReplies, searchMode, auth, cursor);
        return (0, timeline_1.parseTweets)(timeline);
    });
}
exports.fetchSearchTweets = fetchSearchTweets;
function fetchSearchProfiles(query, maxProfiles, auth, cursor) {
    return __awaiter(this, void 0, void 0, function* () {
        const timeline = yield getSearchTimeline(query, maxProfiles, false, SearchMode.Users, auth, cursor);
        return (0, timeline_1.parseUsers)(timeline);
    });
}
exports.fetchSearchProfiles = fetchSearchProfiles;
function getSearchTimeline(query, maxItems, includeReplies, searchMode, auth, cursor) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!auth.isLoggedIn()) {
            throw new Error('Scraper is not logged-in for search.');
        }
        if (maxItems > 50) {
            maxItems = 50;
        }
        const params = new URLSearchParams();
        (0, api_1.addApiParams)(params, includeReplies);
        params.set('q', query);
        params.set('count', `${maxItems}`);
        params.set('query_source', 'typed_query');
        params.set('pc', '1');
        params.set('requestContext', 'launch');
        params.set('spelling_corrections', '1');
        params.set('include_ext_edit_control', 'true');
        if (cursor != null && cursor != '') {
            params.set('cursor', cursor);
        }
        switch (searchMode) {
            case SearchMode.Latest:
                params.set('tweet_search_mode', 'live');
                break;
            case SearchMode.Photos:
                params.set('result_filter', 'image');
                break;
            case SearchMode.Videos:
                params.set('result_filter', 'video');
                break;
            case SearchMode.Users:
                params.set('result_filter', 'user');
                break;
            default:
                break;
        }
        const res = yield (0, api_1.requestApi)(`https://twitter.com/i/api/2/search/adaptive.json?${params.toString()}`, auth);
        if (!res.success) {
            throw res.err;
        }
        return res.value;
    });
}
//# sourceMappingURL=search.js.map