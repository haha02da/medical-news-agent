import Parser from "rss-parser";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "DiseaseNewsMonitor/1.0",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

export type SourceColor = "blue" | "red" | "purple" | "green" | "orange" | "teal" | "indigo" | "pink";

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string | null;
  source: string;
  sourceFullName: string;
  sourceColor: SourceColor;
}

export const SOURCES = [
  {
    id: "who",
    name: "WHO",
    fullName: "세계보건기구 (WHO)",
    url: "https://www.who.int/feeds/entity/csr/don/en/rss.xml",
    color: "green" as const,
  },
  {
    id: "cdc",
    name: "CDC",
    fullName: "미국 질병통제예방센터 (CDC)",
    url: "https://tools.cdc.gov/api/v2/resources/media/403372.rss",
    color: "blue" as const,
  },
  {
    id: "kdca",
    name: "질병청",
    fullName: "한국 질병관리청 (KDCA)",
    url: "https://www.kdca.go.kr/rss/rss.jsp?rcv_code=P0001",
    color: "teal" as const,
  },
  {
    id: "cidrap",
    name: "CIDRAP",
    fullName: "감염병 연구정책센터 (CIDRAP)",
    url: "https://www.cidrap.umn.edu/rss.xml",
    color: "indigo" as const,
  },
  {
    id: "nih",
    name: "NIH",
    fullName: "미국 국립보건원 (NIH)",
    url: "https://www.nih.gov/news-events/news-releases/feed.xml",
    color: "purple" as const,
  },
  {
    id: "outbreak",
    name: "Outbreak News",
    fullName: "Outbreak News Today",
    url: "https://outbreaknewstoday.com/feed",
    color: "red" as const,
  },
  {
    id: "medicalxpress",
    name: "MedicalXpress",
    fullName: "MedicalXpress",
    url: "https://medicalxpress.com/rss-feed/diseases-conditions/",
    color: "orange" as const,
  },
  {
    id: "stat",
    name: "STAT News",
    fullName: "STAT News",
    url: "https://www.statnews.com/feed/",
    color: "pink" as const,
  },
  {
    id: "medpage",
    name: "MedPage",
    fullName: "MedPage Today",
    url: "https://www.medpagetoday.com/rss/headlines.xml",
    color: "green" as const,
  },
  {
    id: "gnews",
    name: "Google Health",
    fullName: "Google News Health",
    url: "https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtdHZLQUFQAQ?hl=en-US&gl=US&ceid=US:en",
    color: "blue" as const,
  },
];

function makeArticleId(sourceId: string, link: string, title: string): string {
  const base = link || title;
  // URL 기반 안정적 ID (링크가 없을 경우 제목 fallback)
  return `${sourceId}::${base.slice(0, 200)}`;
}

export async function fetchAllFeeds(limitPerSource = 8): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    SOURCES.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      return feed.items.slice(0, limitPerSource).map((item): NewsItem => ({
        id: makeArticleId(source.id, item.link ?? "", item.title ?? ""),
        title: item.title?.trim() ?? "제목 없음",
        description:
          item.contentSnippet?.trim() ??
          item.summary?.trim() ??
          "",
        link: item.link ?? "",
        pubDate: item.pubDate ?? item.isoDate ?? null,
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
