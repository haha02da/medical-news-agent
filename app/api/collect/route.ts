import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss";
import { summarizeArticle } from "@/lib/summarize";
import { supabase } from "@/lib/supabase";

export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: log } = await supabase
    .from("collection_logs")
    .insert({ status: "running", articles_new: 0, articles_summarized: 0 })
    .select()
    .single();

  const logId = log?.id;

  try {
    const items = await fetchAllFeeds(10);

    let newCount = 0;
    let summarizedCount = 0;

    for (const item of items) {
      // 중복 체크 후 삽입
      const { data: existing } = await supabase
        .from("news_articles")
        .select("id, summary_ko")
        .eq("article_id", item.id)
        .single();

      if (!existing) {
        // 새 기사 — 요약 생성 후 저장
        let summary_ko: string | null = null;
        try {
          if (item.title || item.description) {
            summary_ko = await summarizeArticle(item.title, item.description ?? "");
            summarizedCount++;
          }
        } catch {
          // 요약 실패해도 기사는 저장
        }

        await supabase.from("news_articles").insert({
          article_id: item.id,
          title: item.title,
          description: item.description ?? null,
          summary_ko,
          link: item.link,
          pub_date: item.pubDate,
          source: item.source,
          source_full: item.sourceFullName,
          source_color: item.sourceColor,
          summarized_at: summary_ko ? new Date().toISOString() : null,
        });
        newCount++;
      } else if (existing && !existing.summary_ko) {
        // 기존 기사인데 요약 없으면 요약만 추가
        try {
          const summary_ko = await summarizeArticle(item.title, item.description ?? "");
          await supabase
            .from("news_articles")
            .update({ summary_ko, summarized_at: new Date().toISOString() })
            .eq("article_id", item.id);
          summarizedCount++;
        } catch {
          // ignore
        }
      }
    }

    if (logId) {
      await supabase
        .from("collection_logs")
        .update({
          status: "success",
          finished_at: new Date().toISOString(),
          articles_new: newCount,
          articles_summarized: summarizedCount,
        })
        .eq("id", logId);
    }

    return NextResponse.json({ success: true, newCount, summarizedCount });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (logId) {
      await supabase
        .from("collection_logs")
        .update({ status: "error", finished_at: new Date().toISOString(), error_msg: msg })
        .eq("id", logId);
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
