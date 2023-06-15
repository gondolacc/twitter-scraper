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
exports.TwitterGuestAuth = void 0;
const got_scraping_1 = require("got-scraping");
const tough_cookie_1 = require("tough-cookie");
/**
 * A guest authentication token manager. Automatically handles token refreshes.
 */
class TwitterGuestAuth {
    constructor(bearerToken, proxyUrl) {
        this.bearerToken = bearerToken;
        this.jar = new tough_cookie_1.CookieJar();
        this._proxyUrl = proxyUrl;
    }
    cookieJar() {
        return this.jar;
    }
    isLoggedIn() {
        return Promise.resolve(false);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    login(_username, _password, _email) {
        return this.updateGuestToken();
    }
    logout() {
        this.deleteToken();
        this.jar = new tough_cookie_1.CookieJar();
        return Promise.resolve();
    }
    deleteToken() {
        delete this.guestToken;
        delete this.guestCreatedAt;
    }
    hasToken() {
        return this.guestToken != null;
    }
    authenticatedAt() {
        if (this.guestCreatedAt == null) {
            return null;
        }
        return new Date(this.guestCreatedAt);
    }
    get proxyUrl() {
        return this._proxyUrl;
    }
    installTo(headers, url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.shouldUpdate()) {
                yield this.updateGuestToken();
            }
            const token = this.guestToken;
            if (token == null) {
                throw new Error('Authentication token is null or undefined.');
            }
            headers['authorization'] = `Bearer ${this.bearerToken}`;
            headers['x-guest-token'] = token;
            const cookies = yield this.jar.getCookies(url);
            const xCsrfToken = cookies.find((cookie) => cookie.key === 'ct0');
            if (xCsrfToken) {
                headers['x-csrf-token'] = xCsrfToken.value;
            }
        });
    }
    /**
     * Updates the authentication state with a new guest token from the Twitter API.
     */
    updateGuestToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield got_scraping_1.gotScraping.post({
                url: 'https://api.twitter.com/1.1/guest/activate.json',
                headers: {
                    Authorization: `Bearer ${this.bearerToken}`,
                },
                proxyUrl: this._proxyUrl,
                cookieJar: this.jar,
            });
            if (res.statusCode != 200) {
                throw new Error(res.body);
            }
            const o = JSON.parse(res.body);
            if (o == null || o['guest_token'] == null) {
                throw new Error('guest_token not found.');
            }
            const newGuestToken = o['guest_token'];
            if (typeof newGuestToken !== 'string') {
                throw new Error('guest_token was not a string.');
            }
            this.guestToken = newGuestToken;
            this.guestCreatedAt = new Date();
        });
    }
    /**
     * Returns if the authentication token needs to be updated or not.
     * @returns `true` if the token needs to be updated; `false` otherwise.
     */
    shouldUpdate() {
        return (!this.hasToken() ||
            (this.guestCreatedAt != null &&
                this.guestCreatedAt <
                    new Date(new Date().valueOf() - 3 * 60 * 60 * 1000)));
    }
}
exports.TwitterGuestAuth = TwitterGuestAuth;
//# sourceMappingURL=auth.js.map