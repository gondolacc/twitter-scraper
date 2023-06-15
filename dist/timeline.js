"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUsers = exports.parseTweets = exports.parseTweet = void 0;
const profile_1 = require("./profile");
const reHashtag = /\B(\#\S+\b)/g;
const reTwitterUrl = /https:(\/\/t\.co\/([A-Za-z0-9]|[A-Za-z]){10})/g;
const reUsername = /\B(\@\S{1,15}\b)/g;
function isFieldDefined(key) {
    return function (value) {
        return isDefined(value[key]);
    };
}
function isDefined(value) {
    return value != null;
}
function parseTweet(timeline, id) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    const tweets = (_b = (_a = timeline.globalObjects) === null || _a === void 0 ? void 0 : _a.tweets) !== null && _b !== void 0 ? _b : {};
    const tweet = tweets[id];
    if ((tweet === null || tweet === void 0 ? void 0 : tweet.user_id_str) == null) {
        return {
            success: false,
            err: new Error(`Tweet "${id}" was not found in the timeline object.`),
        };
    }
    const users = (_d = (_c = timeline.globalObjects) === null || _c === void 0 ? void 0 : _c.users) !== null && _d !== void 0 ? _d : {};
    const user = users[tweet.user_id_str];
    if ((user === null || user === void 0 ? void 0 : user.screen_name) == null) {
        return {
            success: false,
            err: new Error(`User "${tweet.user_id_str}" has no username data.`),
        };
    }
    const hashtags = (_f = (_e = tweet.entities) === null || _e === void 0 ? void 0 : _e.hashtags) !== null && _f !== void 0 ? _f : [];
    const mentions = (_h = (_g = tweet.entities) === null || _g === void 0 ? void 0 : _g.user_mentions) !== null && _h !== void 0 ? _h : [];
    const media = (_k = (_j = tweet.extended_entities) === null || _j === void 0 ? void 0 : _j.media) !== null && _k !== void 0 ? _k : [];
    const pinnedTweets = new Set((_l = user.pinned_tweet_ids_str) !== null && _l !== void 0 ? _l : []);
    const urls = (_o = (_m = tweet.entities) === null || _m === void 0 ? void 0 : _m.urls) !== null && _o !== void 0 ? _o : [];
    const { photos, videos, sensitiveContent } = parseMediaGroups(media);
    const tw = {
        id,
        hashtags: hashtags
            .filter(isFieldDefined('text'))
            .map((hashtag) => hashtag.text),
        likes: tweet.favorite_count,
        mentions: mentions.filter(isFieldDefined('id_str')).map((mention) => ({
            id: mention.id_str,
            username: mention.screen_name,
            name: mention.name,
        })),
        name: user.name,
        permanentUrl: `https://twitter.com/${user.screen_name}/status/${id}`,
        photos,
        replies: tweet.reply_count,
        retweets: tweet.retweet_count,
        text: tweet.full_text,
        urls: urls
            .filter(isFieldDefined('expanded_url'))
            .map((url) => url.expanded_url),
        userId: tweet.user_id_str,
        username: user.screen_name,
        videos,
    };
    if (tweet.created_at != null) {
        tw.timeParsed = new Date(Date.parse(tweet.created_at));
        tw.timestamp = Math.floor(tw.timeParsed.valueOf() / 1000);
    }
    if (((_p = tweet.place) === null || _p === void 0 ? void 0 : _p.id) != null) {
        tw.place = tweet.place;
    }
    if (tweet.quoted_status_id_str != null) {
        const quotedStatusResult = parseTweet(timeline, tweet.quoted_status_id_str);
        if (quotedStatusResult.success) {
            tw.isQuoted = true;
            tw.quotedStatus = quotedStatusResult.tweet;
        }
    }
    if (tweet.in_reply_to_status_id_str != null) {
        const replyStatusResult = parseTweet(timeline, tweet.in_reply_to_status_id_str);
        if (replyStatusResult.success) {
            tw.isReply = true;
            tw.inReplyToStatus = replyStatusResult.tweet;
        }
    }
    if (tweet.retweeted_status_id_str != null) {
        const retweetedStatusResult = parseTweet(timeline, tweet.retweeted_status_id_str);
        if (retweetedStatusResult.success) {
            tw.isRetweet = true;
            tw.retweetedStatus = retweetedStatusResult.tweet;
        }
    }
    const views = parseInt((_r = (_q = tweet.ext_views) === null || _q === void 0 ? void 0 : _q.count) !== null && _r !== void 0 ? _r : '');
    if (!isNaN(views)) {
        tw.views = views;
    }
    if (pinnedTweets.has(tweet.conversation_id_str)) {
        // TODO: Update tests so this can be assigned at the tweet declaration
        tw.isPin = true;
    }
    if (sensitiveContent) {
        // TODO: Update tests so this can be assigned at the tweet declaration
        tw.sensitiveContent = true;
    }
    // HTML parsing with regex :)
    let html = (_s = tweet.full_text) !== null && _s !== void 0 ? _s : '';
    const foundedMedia = [];
    html = html.replace(reHashtag, linkHashtagHtml);
    html = html.replace(reUsername, linkUsernameHtml);
    html = html.replace(reTwitterUrl, unwrapTcoUrlHtml(tweet, foundedMedia));
    for (const { url } of tw.photos) {
        if (foundedMedia.indexOf(url) !== -1) {
            continue;
        }
        html += `<br><img src="${url}"/>`;
    }
    for (const { preview: url } of tw.videos) {
        if (foundedMedia.indexOf(url) !== -1) {
            continue;
        }
        html += `<br><img src="${url}"/>`;
    }
    html = html.replace(/\n/g, '<br>');
    tw.html = html;
    return { success: true, tweet: tw };
}
exports.parseTweet = parseTweet;
function parseMediaGroups(media) {
    const photos = [];
    const videos = [];
    let sensitiveContent = undefined;
    for (const m of media
        .filter(isFieldDefined('id_str'))
        .filter(isFieldDefined('media_url_https'))) {
        if (m.type === 'photo') {
            photos.push({
                id: m.id_str,
                url: m.media_url_https,
            });
        }
        else if (m.type === 'video') {
            videos.push(parseVideo(m));
        }
        const sensitive = m.ext_sensitive_media_warning;
        if (sensitive != null) {
            sensitiveContent =
                sensitive.adult_content ||
                    sensitive.graphic_violence ||
                    sensitive.other;
        }
    }
    return { sensitiveContent, photos, videos };
}
function parseVideo(m) {
    var _a, _b;
    const video = {
        id: m.id_str,
        preview: m.media_url_https,
    };
    let maxBitrate = 0;
    const variants = (_b = (_a = m.video_info) === null || _a === void 0 ? void 0 : _a.variants) !== null && _b !== void 0 ? _b : [];
    for (const variant of variants) {
        const bitrate = variant.bitrate;
        if (bitrate != null && bitrate > maxBitrate && variant.url != null) {
            let variantUrl = variant.url;
            const stringStart = 0;
            const tagSuffixIdx = variantUrl.indexOf('?tag=10');
            if (tagSuffixIdx !== -1) {
                variantUrl = variantUrl.substring(stringStart, tagSuffixIdx + 1);
            }
            video.url = variantUrl;
            maxBitrate = bitrate;
        }
    }
    return video;
}
function linkHashtagHtml(hashtag) {
    return `<a href="https://twitter.com/hashtag/${hashtag.replace('#', '')}">${hashtag}</a>`;
}
function linkUsernameHtml(username) {
    return `<a href="https://twitter.com/${username[0].replace('@', '')}">${username[0]}</a>`;
}
function unwrapTcoUrlHtml(tweet, foundedMedia) {
    return function (tco) {
        var _a, _b, _c, _d;
        for (const entity of (_b = (_a = tweet.entities) === null || _a === void 0 ? void 0 : _a.urls) !== null && _b !== void 0 ? _b : []) {
            if (tco === entity.url && entity.expanded_url != null) {
                return `<a href="${entity.expanded_url}">${tco}</a>`;
            }
        }
        for (const entity of (_d = (_c = tweet.extended_entities) === null || _c === void 0 ? void 0 : _c.media) !== null && _d !== void 0 ? _d : []) {
            if (tco === entity.url && entity.media_url_https != null) {
                foundedMedia.push(entity.media_url_https);
                return `<br><a href="${tco}"><img src="${entity.media_url_https}"/></a>`;
            }
        }
        return tco;
    };
}
function parseTweets(timeline) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    let cursor;
    let pinnedTweet;
    let orderedTweets = [];
    for (const instruction of (_b = (_a = timeline.timeline) === null || _a === void 0 ? void 0 : _a.instructions) !== null && _b !== void 0 ? _b : []) {
        const { pinEntry, addEntries, replaceEntry } = instruction;
        // Handle pin instruction
        const pinnedTweetId = (_g = (_f = (_e = (_d = (_c = pinEntry === null || pinEntry === void 0 ? void 0 : pinEntry.entry) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.item) === null || _e === void 0 ? void 0 : _e.content) === null || _f === void 0 ? void 0 : _f.tweet) === null || _g === void 0 ? void 0 : _g.id;
        if (pinnedTweetId != null) {
            const tweetResult = parseTweet(timeline, pinnedTweetId);
            if (tweetResult.success) {
                pinnedTweet = tweetResult.tweet;
            }
        }
        // Handle add instructions
        for (const { content } of (_h = addEntries === null || addEntries === void 0 ? void 0 : addEntries.entries) !== null && _h !== void 0 ? _h : []) {
            const tweetId = (_l = (_k = (_j = content === null || content === void 0 ? void 0 : content.item) === null || _j === void 0 ? void 0 : _j.content) === null || _k === void 0 ? void 0 : _k.tweet) === null || _l === void 0 ? void 0 : _l.id;
            if (tweetId != null) {
                const tweetResult = parseTweet(timeline, tweetId);
                if (tweetResult.success) {
                    orderedTweets.push(tweetResult.tweet);
                }
            }
            const operation = content === null || content === void 0 ? void 0 : content.operation;
            if (((_m = operation === null || operation === void 0 ? void 0 : operation.cursor) === null || _m === void 0 ? void 0 : _m.cursorType) === 'Bottom') {
                cursor = (_o = operation === null || operation === void 0 ? void 0 : operation.cursor) === null || _o === void 0 ? void 0 : _o.value;
            }
        }
        // Handle replace instruction
        const operation = (_q = (_p = replaceEntry === null || replaceEntry === void 0 ? void 0 : replaceEntry.entry) === null || _p === void 0 ? void 0 : _p.content) === null || _q === void 0 ? void 0 : _q.operation;
        if (((_r = operation === null || operation === void 0 ? void 0 : operation.cursor) === null || _r === void 0 ? void 0 : _r.cursorType) === 'Bottom') {
            cursor = operation.cursor.value;
        }
    }
    if (pinnedTweet != null && orderedTweets.length > 0) {
        orderedTweets = [pinnedTweet, ...orderedTweets];
    }
    return {
        tweets: orderedTweets,
        next: cursor,
    };
}
exports.parseTweets = parseTweets;
function parseUsers(timeline) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    const users = new Map();
    const userObjects = (_b = (_a = timeline.globalObjects) === null || _a === void 0 ? void 0 : _a.users) !== null && _b !== void 0 ? _b : {};
    for (const id in userObjects) {
        const legacy = userObjects[id];
        if (legacy == null) {
            continue;
        }
        const user = (0, profile_1.parseProfile)(legacy);
        users.set(id, user);
    }
    let cursor;
    const orderedProfiles = [];
    for (const instruction of (_d = (_c = timeline.timeline) === null || _c === void 0 ? void 0 : _c.instructions) !== null && _d !== void 0 ? _d : []) {
        for (const entry of (_f = (_e = instruction.addEntries) === null || _e === void 0 ? void 0 : _e.entries) !== null && _f !== void 0 ? _f : []) {
            const userId = (_k = (_j = (_h = (_g = entry.content) === null || _g === void 0 ? void 0 : _g.item) === null || _h === void 0 ? void 0 : _h.content) === null || _j === void 0 ? void 0 : _j.user) === null || _k === void 0 ? void 0 : _k.id;
            const profile = users.get(userId);
            if (profile != null) {
                orderedProfiles.push(profile);
            }
            const operation = (_l = entry.content) === null || _l === void 0 ? void 0 : _l.operation;
            if (((_m = operation === null || operation === void 0 ? void 0 : operation.cursor) === null || _m === void 0 ? void 0 : _m.cursorType) === 'Bottom') {
                cursor = (_o = operation === null || operation === void 0 ? void 0 : operation.cursor) === null || _o === void 0 ? void 0 : _o.value;
            }
        }
        const operation = (_r = (_q = (_p = instruction.replaceEntry) === null || _p === void 0 ? void 0 : _p.entry) === null || _q === void 0 ? void 0 : _q.content) === null || _r === void 0 ? void 0 : _r.operation;
        if (((_s = operation === null || operation === void 0 ? void 0 : operation.cursor) === null || _s === void 0 ? void 0 : _s.cursorType) === 'Bottom') {
            cursor = operation.cursor.value;
        }
    }
    return {
        profiles: orderedProfiles,
        next: cursor,
    };
}
exports.parseUsers = parseUsers;
//# sourceMappingURL=timeline.js.map