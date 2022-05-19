import { addApiParams, requestApi } from './api';
import { TwitterGuestAuth } from './auth';
import { Profile } from './profile';
import { parseTweets, parseUsers, TimelineRaw } from './timeline';
import { getTweetTimeline, getUserTimeline } from './timeline-async';
import { Tweet } from './tweets';

export enum SearchMode {
  Top,
  Latest,
  Photos,
  Videos,
  Users,
}

export function searchTweets(
  query: string,
  maxTweets: number,
  includeReplies: boolean,
  searchMode: SearchMode,
  auth: TwitterGuestAuth,
): AsyncGenerator<Tweet> {
  return getTweetTimeline(query, maxTweets, async (q, mt, c) => {
    const [tweets, next] = await fetchSearchTweets(
      q,
      mt,
      includeReplies,
      searchMode,
      auth,
      c,
    );

    return {
      tweets,
      next,
    };
  });
}

export function searchProfiles(
  query: string,
  maxProfiles: number,
  includeReplies: boolean,
  searchMode: SearchMode,
  auth: TwitterGuestAuth,
): AsyncGenerator<Profile> {
  return getUserTimeline(query, maxProfiles, async (q, mt, c) => {
    const [profiles, next] = await fetchSearchProfiles(
      q,
      mt,
      includeReplies,
      searchMode,
      auth,
      c,
    );

    return {
      profiles,
      next,
    };
  });
}

async function fetchSearchTweets(
  query: string,
  maxTweets: number,
  includeReplies: boolean,
  searchMode: SearchMode,
  auth: TwitterGuestAuth,
  cursor?: string,
): Promise<[Tweet[], string | undefined]> {
  const timeline = await getSearchTimeline(
    query,
    maxTweets,
    includeReplies,
    searchMode,
    auth,
    cursor,
  );

  return parseTweets(timeline);
}

async function fetchSearchProfiles(
  query: string,
  maxProfiles: number,
  includeReplies: boolean,
  searchMode: SearchMode,
  auth: TwitterGuestAuth,
  cursor?: string,
): Promise<[Profile[], string | undefined]> {
  const timeline = await getSearchTimeline(
    query,
    maxProfiles,
    includeReplies,
    searchMode,
    auth,
    cursor,
  );

  return parseUsers(timeline);
}

async function getSearchTimeline(
  query: string,
  maxItems: number,
  includeReplies: boolean,
  searchMode: SearchMode,
  auth: TwitterGuestAuth,
  cursor?: string,
): Promise<TimelineRaw> {
  if (maxItems > 50) {
    maxItems = 50;
  }

  const params = new URLSearchParams();
  addApiParams(params, includeReplies);

  params.set('q', query);
  params.set('count', `${maxItems}`);
  params.set('query_source', 'typed_query');
  params.set('pc', '1');
  params.set('spelling_corrections', '1');
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

  const res = await requestApi<TimelineRaw>(
    `https://twitter.com/i/api/2/search/adaptive.json?${params.toString()}`,
    auth,
  );
  if (!res.success) {
    throw res.err;
  }

  return res.value;
}