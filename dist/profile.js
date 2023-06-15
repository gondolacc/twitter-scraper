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
exports.getUserIdByScreenName = exports.getProfile = exports.parseProfile = void 0;
const api_1 = require("./api");
function parseProfile(user) {
    var _a, _b;
    const profile = {
        avatar: user.profile_image_url_https,
        banner: user.profile_banner_url,
        biography: user.description,
        followersCount: user.followers_count,
        followingCount: user.favourites_count,
        friendsCount: user.friends_count,
        isPrivate: user.protected,
        isVerified: user.verified,
        likesCount: user.favourites_count,
        listedCount: user.listed_count,
        location: user.location,
        name: user.name,
        pinnedTweetIds: user.pinned_tweet_ids_str,
        tweetsCount: user.statuses_count,
        url: `https://twitter.com/${user.screen_name}`,
        userId: user.id_str,
        username: user.screen_name,
    };
    if (user.created_at != null) {
        profile.joined = new Date(Date.parse(user.created_at));
    }
    const urls = (_b = (_a = user.entities) === null || _a === void 0 ? void 0 : _a.url) === null || _b === void 0 ? void 0 : _b.urls;
    if ((urls === null || urls === void 0 ? void 0 : urls.length) != null && (urls === null || urls === void 0 ? void 0 : urls.length) > 0) {
        profile.website = urls[0].expanded_url;
    }
    return profile;
}
exports.parseProfile = parseProfile;
function getProfile(username, auth) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield (0, api_1.requestApi)('https://api.twitter.com/graphql/4S2ihIKfF3xhp-ENxvUAfQ/UserByScreenName?variables=%7B%22screen_name%22%3A%22' +
            username +
            '%22%2C%22withHighlightedLabel%22%3Atrue%7D', auth);
        if (!res.success) {
            return res;
        }
        const { value } = res;
        const { errors } = value;
        if (errors != null && errors.length > 0) {
            return {
                success: false,
                err: new Error(errors[0].message),
            };
        }
        const { user } = value.data;
        const { legacy } = user;
        if (user.rest_id == null || user.rest_id.length === 0) {
            return {
                success: false,
                err: new Error('rest_id not found.'),
            };
        }
        legacy.id_str = user.rest_id;
        if (legacy.screen_name == null || legacy.screen_name.length === 0) {
            return {
                success: false,
                err: new Error(`Either ${username} does not exist or is private.`),
            };
        }
        return {
            success: true,
            value: parseProfile(user.legacy),
        };
    });
}
exports.getProfile = getProfile;
const idCache = new Map();
function getUserIdByScreenName(screenName, auth) {
    return __awaiter(this, void 0, void 0, function* () {
        const cached = idCache.get(screenName);
        if (cached != null) {
            return { success: true, value: cached };
        }
        const profileRes = yield getProfile(screenName, auth);
        if (!profileRes.success) {
            return profileRes;
        }
        const profile = profileRes.value;
        if (profile.userId != null) {
            idCache.set(screenName, profile.userId);
            return {
                success: true,
                value: profile.userId,
            };
        }
        return {
            success: false,
            err: new Error('User ID is undefined.'),
        };
    });
}
exports.getUserIdByScreenName = getUserIdByScreenName;
//# sourceMappingURL=profile.js.map