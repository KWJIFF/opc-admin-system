import PageShell from "@/components/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Rss, Globe, ExternalLink, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const typeIcons: Record<string, { label: string; variant: string }> = {
  rss: { label: "RSS", variant: "bg-orange-100 text-orange-700" },
  api: { label: "API", variant: "bg-blue-100 text-blue-700" },
  web: { label: "网页", variant: "bg-purple-100 text-purple-700" },
  manual: { label: "手动", variant: "bg-gray-100 text-gray-600" },
};

const mockSources = [
  { id: 1, name: "TechCrunch", url: "https://techcrunch.com/feed", sourceType: "rss", category: "科技媒体", status: "active", lastFetchAt: "2026-04-09 10:00", signalCount: 342 },
  { id: 2, name: "36氪", url: "https://36kr.com/feed", sourceType: "rss", category: "科技媒体", status: "active", lastFetchAt: "2026-04-09 09:30", signalCount: 528 },
  { id: 3, name: "新华社", url: "https://xinhuanet.com", sourceType: "web", category: "官方媒体", status: "active", lastFetchAt: "2026-04-09 08:00", signalCount: 156 },
  { id: 4, name: "GitHub Trending", url: "https://api.github.com/trending", sourceType: "api", category: "开发者", status: "active", lastFetchAt: "2026-04-09 06:00", signalCount: 89 },
  { id: 5, name: "虎嗅", url: "https://huxiu.com/feed", sourceType: "rss", category: "科技媒体", status: "inactive", lastFetchAt: "2026-04-07 12:00", signalCount: 213 },
  { id: 6, name: "行业报告手动录入", url: "-", sourceType: "manual", category: "行业报告", status: "active", lastFetchAt: "2026-04-08 15:00", signalCount: 45 },
];

export default function Sources() {
  return (
    <PageShell
      title="来源管理"
      description="管理信号采集数据源"
      icon={<Rss className="h-5 w-5" />}
      action={{ label: "添加来源", onClick: () => toast.info("添加来源功能即将上线") }}
    >
      <div className="space-y-3">
        {mockSources.map((source, i) => {
          const tc = typeIcons[source.sourceType];
          return (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground">{source.name}</span>
                          <Badge variant="secondary" className={`${tc.variant} border-0 text-[10px]`}>{tc.label}</Badge>
                          <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px]">{source.category}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{source.url}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">累计 {source.signalCount} 条信号</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">最近采集 {source.lastFetchAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={source.status === "active"} onCheckedChange={() => toast.info("状态切换功能即将上线")} />
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast.info("功能即将上线")}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast.info("功能即将上线")}>
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </PageShell>
  );
}
