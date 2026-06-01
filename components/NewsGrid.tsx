import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/supabase";
import { NewsCard } from "@/components/NewsCard";

async function getNews() {
  const { data, error } = await supabase.from("latest_news").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function NewsGrid() {
  "use cache";
  cacheLife("hours");
  cacheTag("disease-news");

  const items = await getNews();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <p className="text-muted-foreground text-sm">
          아직 수집된 뉴스가 없습니다.
        </p>
        <p className="text-muted-foreground text-xs">
          Vercel Cron이 매시간 자동으로 최신 뉴스를 수집합니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}
    </div>
  );
}
