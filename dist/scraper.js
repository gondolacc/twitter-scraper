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
exports.Scraper = void 0;
const api_1 = require("./api");
const auth_1 = require("./auth");
const auth_user_1 = require("./auth-user");
const profile_1 = require("./profile");
const search_1 = require("./search");
const trends_1 = require("./trends");
const tweets_1 = require("./tweets");
const twUrl = 'https://twitter.com';
/**
 * An interface to Twitter's undocumented API.
 * Reusing Scraper objects is recommended to minimize the time spent authenticating unnecessarily.
 */
class Scraper {
    /**
     * Creates a new Scraper object. Scrapers maintain their own guest tokens for Twitter's internal API.
     * Reusing Scraper objects is recommended to minimize the time spent authenticating unnecessarily.
     */
    constructor(proxyUrl) {
        this.auth = new auth_1.TwitterGuestAuth(api_1.bearerToken, proxyUrl);
        this.authTrends = new auth_1.TwitterGuestAuth(api_1.bearerToken2, proxyUrl);
    }
    /**
     * Fetches a Twitter profile.
     * @param username The Twitter username of the profile to fetch, without an `@` at the beginning.
     * @returns The requested profile.
     */
    getProfile(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield (0, profile_1.getProfile)(username, this.auth);
            return this.handleResponse(res);
        });
    }
    /**
     * Fetches the user ID corresponding to the provided screen name.
     * @param screenName The Twitter screen name of the profile to fetch.
     * @returns The ID of the corresponding account.
     */
    getUserIdByScreenName(screenName) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield (0, profile_1.getUserIdByScreenName)(screenName, this.auth);
            return this.handleResponse(res);
        });
    }
    /**
     * Fetches tweets from Twitter.
     * @param query The search query. Any Twitter-compatible query format can be used.
     * @param maxTweets The maximum number of tweets to return.
     * @param includeReplies Whether or not replies should be included in the response.
     * @param searchMode The category filter to apply to the search. Defaults to `Top`.
     * @returns An async generator of tweets matching the provided filters.
     */
    searchTweets(query, maxTweets, includeReplies, searchMode = search_1.SearchMode.Top) {
        return (0, search_1.searchTweets)(query, maxTweets, includeReplies, searchMode, this.auth);
    }
    /**
     * Fetches profiles from Twitter.
     * @param query The search query. Any Twitter-compatible query format can be used.
     * @param maxProfiles The maximum number of profiles to return.
     * @returns An async generator of tweets matching the provided filters.
     */
    searchProfiles(query, maxProfiles) {
        return (0, search_1.searchProfiles)(query, maxProfiles, this.auth);
    }
    /**
     * Fetches tweets from Twitter.
     * @param query The search query. Any Twitter-compatible query format can be used.
     * @param maxTweets The maximum number of tweets to return.
     * @param includeReplies Whether or not replies should be included in the response.
     * @param searchMode The category filter to apply to the search. Defaults to `Top`.
     * @param cursor The search cursor, which can be passed into further requests for more results.
     * @returns A page of results, containing a cursor that can be used in further requests.
     */
    fetchSearchTweets(query, maxTweets, includeReplies, searchMode, cursor) {
        return (0, search_1.fetchSearchTweets)(query, maxTweets, includeReplies, searchMode, this.auth, cursor);
    }
    /**
     * Fetches profiles from Twitter.
     * @param query The search query. Any Twitter-compatible query format can be used.
     * @param maxProfiles The maximum number of profiles to return.
     * @param cursor The search cursor, which can be passed into further requests for more results.
     * @returns A page of results, containing a cursor that can be used in further requests.
     */
    fetchSearchProfiles(query, maxProfiles, cursor) {
        return (0, search_1.fetchSearchProfiles)(query, maxProfiles, this.auth, cursor);
    }
    /**
     * Fetches the current trends from Twitter.
     * @returns The current list of trends.
     */
    getTrends() {
        return (0, trends_1.getTrends)(this.authTrends);
    }
    /**
     * Fetches tweets from a Twitter user.
     * @param user The user whose tweets should be returned.
     * @param maxTweets The maximum number of tweets to return.
     * @param includeReplies Whether or not to include tweet replies.
     * @returns An async generator of tweets from the provided user.
     */
    getTweets(user, maxTweets, includeReplies) {
        return (0, tweets_1.getTweets)(user, maxTweets, includeReplies, this.auth);
    }
    /**
     * Fetches tweets from a Twitter user using their ID.
     * @param userId The user whose tweets should be returned.
     * @param maxTweets The maximum number of tweets to return.
     * @param includeReplies Whether or not to include tweet replies.
     * @returns An async generator of tweets from the provided user.
     */
    getTweetsByUserId(userId, maxTweets, includeReplies) {
        return (0, tweets_1.getTweetsByUserId)(userId, maxTweets, includeReplies, this.auth);
    }
    /**
     * Fetches the most recent tweet from a Twitter user.
     * @param user The user whose latest tweet should be returned.
     * @param includeReplies Whether or not to include tweet replies.
     * @param includeRetweets Whether or not to include retweets.
     * @returns The {@link Tweet} object or `null` if it couldn't be fetched.
     */
    getLatestTweet(user, includeReplies, includeRetweets) {
        return (0, tweets_1.getLatestTweet)(user, includeReplies, includeRetweets, this.auth);
    }
    /**
     * Fetches a single tweet.
     * @param id The ID of the tweet to fetch.
     * @param includeReplies Whether or not to include tweet replies.
     * @returns The request tweet, or `null` if it couldn't be fetched.
     */
    getTweet(id, includeReplies) {
        return (0, tweets_1.getTweet)(id, includeReplies, this.auth);
    }
    /**
     * Returns if the scraper has a guest token. The token may not be valid.
     * @returns `true` if the scraper has a guest token; otherwise `false`.
     */
    hasGuestToken() {
        return this.auth.hasToken() || this.authTrends.hasToken();
    }
    /**
     * Returns if the scraper is logged in as a real user.
     * @returns `true` if the scraper is logged in with a real user account; otherwise `false`.
     */
    isLoggedIn() {
        return __awaiter(this, void 0, void 0, function* () {
            return ((yield this.auth.isLoggedIn()) && (yield this.authTrends.isLoggedIn()));
        });
    }
    /**
     * Login to Twitter as a real Twitter account. This enables running
     * searches.
     * @param username The username of the Twitter account to login with.
     * @param password The password of the Twitter account to login with.
     * @param email The password to log in with, if you have email confirmation enabled.
     */
    login(username, password, email) {
        return __awaiter(this, void 0, void 0, function* () {
            // Swap in a real authorizer for all requests
            const userAuth = new auth_user_1.TwitterUserAuth(api_1.bearerToken2);
            yield userAuth.login(username, password, email);
            this.auth = userAuth;
            this.authTrends = userAuth;
        });
    }
    /**
     * Log out of Twitter.
     */
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.auth.logout();
            yield this.authTrends.logout();
            // Swap in guest authorizers for all requests
            this.auth = new auth_1.TwitterGuestAuth(api_1.bearerToken);
            this.authTrends = new auth_1.TwitterGuestAuth(api_1.bearerToken2);
        });
    }
    /**
     * Retrieves all cookies for the current session.
     * @returns All cookies for the current session.
     */
    getCookies() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.authTrends.cookieJar().getCookies(twUrl);
        });
    }
    /**
     * Set cookies for the current session.
     * @param cookies The cookies to set for the current session.
     */
    setCookies(cookies) {
        return __awaiter(this, void 0, void 0, function* () {
            const userAuth = new auth_user_1.TwitterUserAuth(api_1.bearerToken2);
            for (const cookie of cookies) {
                yield userAuth.cookieJar().setCookie(cookie, twUrl);
            }
            this.auth = userAuth;
            this.authTrends = userAuth;
        });
    }
    /**
     * Sets the optional cookie to be used in requests.
     * @param _cookie The cookie to be used in requests.
     * @deprecated This function no longer represents any part of Twitter's auth flow.
     * @returns This scraper instance.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    withCookie(_cookie) {
        console.warn('Warning: Scraper#withCookie is deprecated and will be removed in a later version. Use Scraper#login or Scraper#setCookies instead.');
        return this;
    }
    /**
     * Sets the optional CSRF token to be used in requests.
     * @param _token The CSRF token to be used in requests.
     * @deprecated This function no longer represents any part of Twitter's auth flow.
     * @returns This scraper instance.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    withXCsrfToken(_token) {
        console.warn('Warning: Scraper#withXCsrfToken is deprecated and will be removed in a later version.');
        return this;
    }
    handleResponse(res) {
        if (!res.success) {
            throw res.err;
        }
        return res.value;
    }
}
exports.Scraper = Scraper;
//# sourceMappingURL=scraper.js.map