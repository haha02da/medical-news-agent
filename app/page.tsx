import { Suspense } from "react";
import { NewsGrid } from "@/components/NewsGrid";
import { NewsSkeleton } from "@/components/NewsSkeleton";
import { RefreshButton } from "@/components/RefreshButton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";

const SOURCES = [
  { name: "CIDRAP",        color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { name: "Outbreak News", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  { name: "STAT News",     color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { name: "MedPage",       color: "bg-green-500/10 text-green-400 border-green-500/20" },
];

async function getLastCollectionInfo() {
  const { data } = await supabase
    .from("collection_logs")
    .select("finished_at, status, articles_new, articles_summarized")
    .eq("status", "success")
    .order("finished_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export default async function Home() {
  const lastCollection = await getLastCollectionInfo();
  const lastRun = lastCollection?.finished_at
    ? new Intl.DateTimeFormat("ko-KR", {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      }).format(new Date(lastCollection.finished_at))
    : null;

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight">
                  질병 정보 모니터
                </h1>
                <Badge variant="secondary" className="text-[10px] px-1.5">
                  AI 요약
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                주요 보건 기관의 최신 질병 발생 정보를 AI가 한국어로 요약합니다
              </p>
              {lastRun && (
                <p className="text-xs text-muted-foreground/60">
                  마지막 수집: {lastRun}
                  {lastCollection?.articles_new
                    ? ` · 신규 ${lastCollection.articles_new}건`
                    : ""}
                </p>
              )}
            </div>
            <RefreshButton />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {SOURCES.map((source) => (
              <span
                key={source.name}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${source.color}`}
              >
                {source.name}
              </span>
            ))}
          </div>

          <Separator />
        </div>

        <Suspense fallback={<NewsSkeleton />}>
          <NewsGrid />
        </Suspense>
      </div>
    </main>
  );
}
