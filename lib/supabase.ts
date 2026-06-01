import { createClient } from "@supabase/supabase-js";

export type NewsArticle = {
  id: string;
  article_id: string;
  title: string;
  description: string | null;
  summary_ko: string | null;
  link: string;
  pub_date: string | null;
  source: string;
  source_full: string;
  source_color: "blue" | "red" | "purple" | "green";
  collected_at: string;
  summarized_at: string | null;
};

export type CollectionLog = {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: "running" | "success" | "error";
  articles_new: number;
  articles_summarized: number;
  error_msg: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<{
  public: {
    Tables: {
      news_articles: { Row: NewsArticle; Insert: Omit<NewsArticle, "id" | "collected_at">; Update: Partial<NewsArticle> };
      collection_logs: { Row: CollectionLog; Insert: Omit<CollectionLog, "id" | "started_at">; Update: Partial<CollectionLog> };
    };
    Views: {
      latest_news: { Row: NewsArticle };
    };
  };
}>(supabaseUrl, supabaseKey);
