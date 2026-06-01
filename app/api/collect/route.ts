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
    let newCount = 0;
    let summarizedCount = 0;

    // 1단계: RSS 수집 및 신규 기사 저장
    const items = await fetchAllFeeds(10);

    for (const item of items) {
      const { data: existing } = await supabase
        .from("news_articles")
        .select("id, summary_ko")
        .eq("article_id", item.id)
        .single();

      if (!existing) {
        let summary_ko: string | null = null;
        try {
          if (item.title || item.description) {
            summary_ko = await summarizeArticle(item.title, item.description ?? "");
            summarizedCount++;
          }
        } catch {
          // 요약 실패해도 저장
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
      }
    }

    // 2단계: DB에서 미요약 기사 조회 후 요약 (최대 30건/회)
    const { data: pending } = await supabase
      .from("news_articles")
      .select("id, article_id, title, description")
      .is("summary_ko", null)
      .order("collected_at", { ascending: true })
      .limit(30);

    for (const article of pending ?? []) {
      try {
        const summary_ko = await summarizeArticle(
          article.title,
          article.description ?? ""
        );
        await supabase
          .from("news_articles")
          .update({ summary_ko, summarized_at: new Date().toISOString() })
          .eq("id", article.id);
        summarizedCount++;
      } catch {
        // 개별 실패는 무시하고 계속
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
