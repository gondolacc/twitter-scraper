import { LegacyUserRaw, Profile } from './profile';
import { PlaceRaw, Tweet } from './tweets';
export interface Hashtag {
    text?: string;
}
export interface TimelineUserMentionBasicRaw {
    id_str?: string;
    name?: string;
    screen_name?: string;
}
export interface TimelineMediaBasicRaw {
    media_url_https?: string;
    type?: string;
    url?: string;
}
export interface TimelineUrlBasicRaw {
    expanded_url?: string;
    url?: string;
}
export interface ExtSensitiveMediaWarningRaw {
    adult_content?: boolean;
    graphic_violence?: boolean;
    other?: boolean;
}
export interface VideoVariant {
    bitrate?: number;
    url?: string;
}
export interface VideoInfo {
    variants?: VideoVariant[];
}
export interface TimelineMediaExtendedRaw {
    id_str?: string;
    media_url_https?: string;
    ext_sensitive_media_warning?: ExtSensitiveMediaWarningRaw;
    type?: string;
    url?: string;
    video_info?: VideoInfo;
}
export interface TimelineTweetRaw {
    conversation_id_str?: string;
    created_at?: string;
    favorite_count?: number;
    full_text?: string;
    entities?: {
        hashtags?: Hashtag[];
        media?: TimelineMediaBasicRaw[];
        urls?: TimelineUrlBasicRaw[];
        user_mentions?: TimelineUserMentionBasicRaw[];
    };
    extended_entities?: {
        media?: TimelineMediaExtendedRaw[];
    };
    in_reply_to_status_id_str?: string;
    place?: PlaceRaw;
    reply_count?: number;
    retweet_count?: number;
    retweeted_status_id_str?: string;
    quoted_status_id_str?: string;
    time?: string;
    user_id_str?: string;
    ext_views?: {
        state?: string;
        count?: string;
    };
}
export interface TimelineGlobalObjectsRaw {
    tweets?: {
        [key: string]: TimelineTweetRaw | undefined;
    };
    users?: {
        [key: string]: LegacyUserRaw | undefined;
    };
}
export interface TimelineDataRawCursor {
    value?: string;
    cursorType?: string;
}
export interface TimelineDataRawEntity {
    id?: string;
}
export interface TimelineDataRawModuleItem {
    clientEventInfo?: {
        details?: {
            guideDetails?: {
                transparentGuideDetails?: {
                    trendMetadata?: {
                        trendName?: string;
                    };
                };
            };
        };
    };
}
export interface TimelineDataRawAddEntry {
    content?: {
        item?: {
            content?: {
                tweet?: TimelineDataRawEntity;
                user?: TimelineDataRawEntity;
            };
        };
        operation?: {
            cursor?: TimelineDataRawCursor;
        };
        timelineModule?: {
            items?: {
                item?: TimelineDataRawModuleItem;
            }[];
        };
    };
}
export interface TimelineDataRawPinEntry {
    content?: {
        item?: {
            content?: {
                tweet?: TimelineDataRawEntity;
            };
        };
    };
}
export interface TimelineDataRawReplaceEntry {
    content?: {
        operation?: {
            cursor?: TimelineDataRawCursor;
        };
    };
}
export interface TimelineDataRawInstruction {
    addEntries?: {
        entries?: TimelineDataRawAddEntry[];
    };
    pinEntry?: {
        entry?: TimelineDataRawPinEntry;
    };
    replaceEntry?: {
        entry?: TimelineDataRawReplaceEntry;
    };
}
export interface TimelineDataRaw {
    instructions?: TimelineDataRawInstruction[];
}
export interface TimelineRaw {
    globalObjects?: TimelineGlobalObjectsRaw;
    timeline?: TimelineDataRaw;
}
type ParseTweetResult = {
    success: true;
    tweet: Tweet;
} | {
    success: false;
    err: Error;
};
export declare function parseTweet(timeline: TimelineRaw, id: string): ParseTweetResult;
/**
 * A paginated tweets API response. The `next` field can be used to fetch the next page of results.
 */
export interface QueryTweetsResponse {
    tweets: Tweet[];
    next?: string;
}
export declare function parseTweets(timeline: TimelineRaw): QueryTweetsResponse;
/**
 * A paginated profiles API response. The `next` field can be used to fetch the next page of results.
 */
export interface QueryProfilesResponse {
    profiles: Profile[];
    next?: string;
}
export declare function parseUsers(timeline: TimelineRaw): QueryProfilesResponse;
export {};
//# sourceMappingURL=timeline.d.ts.map