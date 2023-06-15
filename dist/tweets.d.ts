import { TwitterAuth } from './auth';
import { QueryTweetsResponse } from './timeline';
export interface Mention {
    id: string;
    username?: string;
    name?: string;
}
export interface Photo {
    id: string;
    url: string;
}
export interface Video {
    id: string;
    preview: string;
    url?: string;
}
export interface PlaceRaw {
    id?: string;
    place_type?: string;
    name?: string;
    full_name?: string;
    country_code?: string;
    country?: string;
    bounding_box?: {
        type?: string;
        coordinates?: number[][][];
    };
}
/**
 * A parsed Tweet object.
 */
export interface Tweet {
    hashtags: string[];
    html?: string;
    id?: string;
    inReplyToStatus?: Tweet;
    isQuoted?: boolean;
    isPin?: boolean;
    isReply?: boolean;
    isRetweet?: boolean;
    likes?: number;
    name?: string;
    mentions: Mention[];
    permanentUrl?: string;
    photos: Photo[];
    place?: PlaceRaw;
    quotedStatus?: Tweet;
    replies?: number;
    retweets?: number;
    retweetedStatus?: Tweet;
    text?: string;
    timeParsed?: Date;
    timestamp?: number;
    urls: string[];
    userId?: string;
    username?: string;
    videos: Video[];
    views?: number;
    sensitiveContent?: boolean;
}
export declare function fetchTweets(userId: string, maxTweets: number, includeReplies: boolean, cursor: string | undefined, auth: TwitterAuth): Promise<QueryTweetsResponse>;
export declare function getTweets(user: string, maxTweets: number, includeReplies: boolean, auth: TwitterAuth): AsyncGenerator<Tweet>;
export declare function getTweetsByUserId(userId: string, maxTweets: number, includeReplies: boolean, auth: TwitterAuth): AsyncGenerator<Tweet>;
export declare function getLatestTweet(user: string, includeReplies: boolean, includeRetweets: boolean, auth: TwitterAuth): Promise<Tweet | null>;
export declare function getTweet(id: string, includeReplies: boolean, auth: TwitterAuth): Promise<Tweet | null>;
//# sourceMappingURL=tweets.d.ts.map