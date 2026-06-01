import { Suspense } from "react";
import { NewsGrid } from "@/components/NewsGrid";
import { NewsSkeleton } from "@/components/NewsSkeleton";
import { RefreshButton } from "@/components/RefreshButton";
import { CollectionStatus } from "@/components/CollectionStatus";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const SOURCES = [
  { name: "WHO",           color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { name: "CDC",           color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { name: "질병청",         color: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
  { name: "NIH",           color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { name: "CIDRAP",        color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { name: "Outbreak News", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  { name: "MedicalXpress", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { name: "STAT News",     color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  { name: "MedPage",       color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { name: "Google Health", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
];

export default function Home() {
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
              <Suspense fallback={null}>
                <CollectionStatus />
              </Suspense>
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
