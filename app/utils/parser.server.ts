import Parser from "rss-parser";

const parser = new Parser();

type ItemType = {
  fallBackTitle: string;
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

export async function getFeedSortedByDate(urls: string[]) {
  let sortedFeed = [] as ItemType[];
  const feeds = await getMultipleFeeds(urls);
  for (const i of feeds) {
    const newI = i.items.map((item) => {
      return { ...item, fallBackTitle: i.title };
    });
    //@ts-ignore
    sortedFeed = [...sortedFeed, ...newI];
  }
  sortedFeed.sort((a, b) => {
    return new Date(a.pubDate) < new Date(b.pubDate) ? 1 : -1;
  });

  return sortedFeed;
}
