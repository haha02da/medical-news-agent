import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { NewsArticle } from "@/lib/supabase";

const SOURCE_STYLES: Record<string, { badge: string; dot: string }> = {
  blue:   { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15",     dot: "bg-blue-400" },
  red:    { badge: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15",         dot: "bg-red-400" },
  purple: { badge: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/15", dot: "bg-purple-400" },
  green:  { badge: "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/15", dot: "bg-green-400" },
  orange: { badge: "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/15", dot: "bg-orange-400" },
  teal:   { badge: "bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/15",     dot: "bg-teal-400" },
  indigo: { badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/15", dot: "bg-indigo-400" },
  pink:   { badge: "bg-pink-500/10 text-pink-400 border-pink-500/20 hover:bg-pink-500/15",     dot: "bg-pink-400" },
};

function formatDate(pubDate: string | null) {
  if (!pubDate) return null;
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

interface Props {
  item: NewsArticle;
}

export function NewsCard({ item }: Props) {
  const style = SOURCE_STYLES[item.source_color] ?? SOURCE_STYLES.blue;
  const date = formatDate(item.pub_date);

  return (
    <Card className="flex flex-col h-full bg-card border-border hover:border-border/80 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline" className={`text-xs shrink-0 ${style.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`} />
            {item.source}
          </Badge>
          {date && (
            <span className="text-xs text-muted-foreground font-mono shrink-0">
              {date}
            </span>
          )}
        </div>
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="group">
          <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-3">
            {item.title}
          </h3>
        </a>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-0 flex-1">
        {item.summary_ko && (
          <>
            <Separator className="bg-border/50" />
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-primary/60 uppercase tracking-wider">
                AI 요약
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4">
                {item.summary_ko}
              </p>
            </div>
          </>
        )}

        {!item.summary_ko && item.description && (
          <>
            <Separator className="bg-border/50" />
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
              {item.description}
            </p>
          </>
        )}

        {item.link && (
          <div className="mt-auto pt-2">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              원문 보기 →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
