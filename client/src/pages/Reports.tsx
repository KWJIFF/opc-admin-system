import PageShell from "@/components/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const typeLabels: Record<string, { label: string; variant: string }> = {
  weekly: { label: "周报", variant: "bg-blue-100 text-blue-700" },
  monthly: { label: "月报", variant: "bg-purple-100 text-purple-700" },
  quarterly: { label: "季报", variant: "bg-amber-100 text-amber-700" },
  special: { label: "专题", variant: "bg-emerald-100 text-emerald-700" },
};

const mockReports = [
  { id: 1, title: "第14周运营周报", reportType: "weekly", period: "2026-W14", status: "published", publishedAt: "2026-04-07", summary: "本周新增信号 42 条，发布内容 8 篇，公众号阅读量增长 15%。" },
  { id: 2, title: "3月运营月报", reportType: "monthly", period: "2026-03", status: "published", publishedAt: "2026-04-02", summary: "3月总计发布 35 篇内容，覆盖 5 个平台，总阅读量 12.5 万。" },
  { id: 3, title: "Q1季度总结报告", reportType: "quarterly", period: "2026-Q1", status: "draft", publishedAt: "-", summary: "第一季度内容运营全面复盘，包含数据分析和下季度规划。" },
  { id: 4, title: "AI内容生产专题报告", reportType: "special", period: "2026-04", status: "published", publishedAt: "2026-04-05", summary: "深度分析 AI 在内容生产中的应用场景和效率提升数据。" },
  { id: 5, title: "第13周运营周报", reportType: "weekly", period: "2026-W13", status: "published", publishedAt: "2026-03-31", summary: "本周重点推进数据安全合规系列内容，完成 3 篇深度文章。" },
];

export default function Reports() {
  return (
    <PageShell
      title="报告中心"
      description="周报、月报与专题报告管理"
      icon={<BarChart3 className="h-5 w-5" />}
      action={{ label: "生成报告", onClick: () => toast.info("AI 报告生成功能即将上线") }}
    >
      <div className="space-y-3">
        {mockReports.map((report, i) => {
          const typeConfig = typeLabels[report.reportType];
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Card className="card-elevated border-border/30 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className={`${typeConfig.variant} border-0 text-[11px]`}>
                          {typeConfig.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{report.period}</span>
                        {report.status === "draft" && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0 text-[11px]">草稿</Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-foreground mb-1">{report.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{report.summary}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button variant="outline" size="sm" className="h-8 border-border/30" onClick={() => toast.info("查看报告功能即将上线")}>
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        查看
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-border/30" onClick={() => toast.info("下载功能即将上线")}>
                        <Download className="h-3.5 w-3.5" />
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
