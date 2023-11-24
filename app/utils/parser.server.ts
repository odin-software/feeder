import Parser from "rss-parser";

const parser = new Parser();

export async function getFeed(url: string) {
  const feed = await parser.parseURL(url);
  return feed;
}

export async function getMultipleFeeds(urls: string[]) {
  const feeds = await Promise.all(urls.map((url) => getFeed(url)));
  return feeds;
}
