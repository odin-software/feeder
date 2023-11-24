import Parser from "rss-parser";

const parser = new Parser();

export type SingleItem = {
  fallBackTitle: string;
  image: string;
  creator: string;
  title: string;
  link: string;
  pubDate: string;
};

export async function getFeed(url: string) {
  const feed = await parser.parseURL(url);
  return feed;
}

export async function getMultipleFeeds(urls: string[]) {
  const feeds = await Promise.all(urls.map((url) => getFeed(url)));
  return feeds;
}

/**
 * This function takes an array of feed urls and returns an array of items
 * sorted by date. It only returns the first 15 items from each feed.
 * @param {string[]} urls - An array of feed urls.
 * @returns {SingleItem[]} An array of items sorted by date.
 */
export async function getFeedSortedByDate(
  urls: string[]
): Promise<SingleItem[]> {
  let sortedFeed = [] as SingleItem[];
  const feeds = await getMultipleFeeds(urls);
  for (const i of feeds) {
    const newI = i.items.map((item, idx) => {
      if (idx < 15) {
        const image = i.image?.url ? i.image?.url : i.itunes?.image;
        return { ...item, fallBackTitle: i.title, image: image };
      }
      return null;
    });
    //@ts-ignore
    sortedFeed = [...sortedFeed, ...newI];
  }
  const filtered = sortedFeed.filter((item) => item !== null);
  filtered.sort((a, b) => {
    return new Date(a.pubDate) < new Date(b.pubDate) ? 1 : -1;
  });

  return filtered;
}

export async function turnFeedItemsIntoSingleItems(
  url: string
): Promise<SingleItem[]> {
  const feed = await getFeed(url);
  const items = feed.items;

  const newItems = items.map((item) => {
    return {
      fallBackTitle: feed.title || "",
      image: feed.image?.url ? feed.image?.url : feed.itunes?.image || "",
      creator: item.creator || "",
      title: item.title || "",
      link: item.link || "",
      pubDate: item.pubDate || ""
    };
  });

  return newItems;
}
