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
exports.addApiParams = exports.requestApi = exports.bearerToken2 = exports.bearerToken = void 0;
const got_scraping_1 = require("got-scraping");
const errors_1 = require("./errors");
exports.bearerToken = 'AAAAAAAAAAAAAAAAAAAAAPYXBAAAAAAACLXUNDekMxqa8h%2F40K4moUkGsoc%3DTYfbDKbT3jJPCEVnMYqilB28NHfOPqkca3qaAxGfsyKCs0wRbw';
exports.bearerToken2 = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';
function requestApi(url, auth, method = 'get') {
    return __awaiter(this, void 0, void 0, function* () {
        const headers = {};
        yield auth.installTo(headers, url);
        let res;
        try {
            res = yield got_scraping_1.gotScraping[method]({
                url,
                headers,
                cookieJar: auth.cookieJar(),
                proxyUrl: auth.proxyUrl,
            });
        }
        catch (err) {
            if (!(err instanceof Error)) {
                throw err;
            }
            return {
                success: false,
                err: new Error('Failed to perform request.'),
            };
        }
        if (res.statusCode != 200) {
            return {
                success: false,
                err: new errors_1.ApiError(res, `Response status: ${res.statusCode}`),
            };
        }
        const value = JSON.parse(res.body);
        if (res.headers['x-rate-limit-incoming'] == '0') {
            auth.deleteToken();
            return { success: true, value };
        }
        else {
            return { success: true, value };
        }
    });
}
exports.requestApi = requestApi;
function addApiParams(params, includeTweetReplies) {
    params.set('include_profile_interstitial_type', '1');
    params.set('include_blocking', '1');
    params.set('include_blocked_by', '1');
    params.set('include_followed_by', '1');
    params.set('include_want_retweets', '1');
    params.set('include_mute_edge', '1');
    params.set('include_can_dm', '1');
    params.set('include_can_media_tag', '1');
    params.set('include_ext_has_nft_avatar', '1');
    params.set('include_ext_is_blue_verified', '1');
    params.set('include_ext_verified_type', '1');
    params.set('skip_status', '1');
    params.set('cards_platform', 'Web-12');
    params.set('include_cards', '1');
    params.set('include_ext_alt_text', 'true');
    params.set('include_ext_limited_action_results', 'false');
    params.set('include_quote_count', 'true');
    params.set('include_reply_count', '1');
    params.set('tweet_mode', 'extended');
    params.set('include_ext_collab_control', 'true');
    params.set('include_ext_views', 'true');
    params.set('include_entities', 'true');
    params.set('include_user_entities', 'true');
    params.set('include_ext_media_color', 'true');
    params.set('include_ext_media_availability', 'true');
    params.set('include_ext_sensitive_media_warning', 'true');
    params.set('include_ext_trusted_friends_metadata', 'true');
    params.set('send_error_codes', 'true');
    params.set('simple_quoted_tweet', 'true');
    params.set('include_tweet_replies', `${includeTweetReplies}`);
    params.set('ext', 'mediaStats,highlightedLabel,hasNftAvatar,voiceInfo,birdwatchPivot,enrichments,superFollowMetadata,unmentionInfo,editControl,collab_control,vibe');
    return params;
}
exports.addApiParams = addApiParams;
//# sourceMappingURL=api.js.map