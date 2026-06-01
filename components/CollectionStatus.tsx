import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/supabase";

export async function CollectionStatus() {
  "use cache";
  cacheLife("minutes");
  cacheTag("collection-status");

  const { data } = await supabase
    .from("collection_logs")
    .select("finished_at, status, articles_new")
    .eq("status", "success")
    .order("finished_at", { ascending: false })
    .limit(1)
    .single();

  if (!data?.finished_at) return null;

  const lastRun = new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data.finished_at));

  return (
    <p className="text-xs text-muted-foreground/60">
      마지막 수집: {lastRun}
      {data.articles_new ? ` · 신규 ${data.articles_new}건` : ""}
    </p>
  );
}
