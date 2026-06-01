import Parser from "rss-parser";

const parser = new Parser({
  timeout: 12000,
  headers: {
    "User-Agent": "DiseaseNewsMonitor/1.0",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string | null;
  source: string;
  sourceFullName: string;
  sourceColor: "blue" | "red" | "purple" | "green";
}

const SOURCES = [
  {
    id: "cidrap",
    name: "CIDRAP",
    fullName: "감염병 연구정책센터 (CIDRAP)",
    url: "https://www.cidrap.umn.edu/rss.xml",
    color: "blue" as const,
  },
  {
    id: "outbreak",
    name: "Outbreak News",
    fullName: "Outbreak News Today",
    url: "https://outbreaknewstoday.com/feed",
    color: "red" as const,
  },
  {
    id: "stat",
    name: "STAT News",
    fullName: "STAT News",
    url: "https://www.statnews.com/feed/",
    color: "purple" as const,
  },
  {
    id: "medpage",
    name: "MedPage",
    fullName: "MedPage Today",
    url: "https://www.medpagetoday.com/rss/headlines.xml",
    color: "green" as const,
  },
];

export async function fetchAllFeeds(limitPerSource = 5): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    SOURCES.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      return feed.items.slice(0, limitPerSource).map((item, i): NewsItem => ({
        id: `${source.id}-${i}-${encodeURIComponent(item.title ?? String(i))}`,
        title: item.title?.trim() ?? "제목 없음",
        description:
          item.contentSnippet?.trim() ??
          item.summary?.trim() ??
          "",
        link: item.link ?? "",
        pubDate: item.pubDate ?? null,
        source: source.name,
        sourceFullName: source.fullName,
        sourceColor: source.color,
      }));
    })
  );

  const items: NewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    }
  }

  return items.sort((a, b) => {
    const tA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const tB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return tB - tA;
  });
}
