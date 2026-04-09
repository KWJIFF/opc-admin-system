import PageShell from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Play, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const trendData = [
  { date: "04-01", ai: 85, blockchain: 42, opc: 68 },
  { date: "04-02", ai: 92, blockchain: 38, opc: 72 },
  { date: "04-03", ai: 88, blockchain: 45, opc: 75 },
  { date: "04-04", ai: 95, blockchain: 40, opc: 80 },
  { date: "04-05", ai: 102, blockchain: 35, opc: 78 },
  { date: "04-06", ai: 98, blockchain: 48, opc: 82 },
  { date: "04-07", ai: 110, blockchain: 42, opc: 85 },
];

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  running: <Play className="h-4 w-4 text-blue-500" />,
  pending: <Clock className="h-4 w-4 text-amber-500" />,
  failed: <AlertCircle className="h-4 w-4 text-red-500" />,
};

const statusLabels: Record<string, { label: string; variant: string }> = {
  completed: { label: "已完成", variant: "bg-emerald-100 text-emerald-700" },
  running: { label: "运行中", variant: "bg-blue-100 text-blue-700" },
  pending: { label: "待执行", variant: "bg-amber-100 text-amber-700" },
  failed: { label: "失败", variant: "bg-red-100 text-red-700" },
};

const mockTasks = [
  { id: 1, title: "AI 行业趋势周度分析", taskType: "trend_analysis", status: "completed", lastRunAt: "2026-04-09 08:00", scheduleCron: "每周一 08:00" },
  { id: 2, title: "竞品内容监控 - 36氪/虎嗅", taskType: "competitor_monitor", status: "running", lastRunAt: "2026-04-09 10:00", scheduleCron: "每日 10:00" },
  { id: 3, title: "关键词热度追踪", taskType: "keyword_tracking", status: "completed", lastRunAt: "2026-04-09 06:00", scheduleCron: "每日 06:00" },
  { id: 4, title: "社交媒体舆情分析", taskType: "custom", status: "pending", lastRunAt: "2026-04-08 18:00", scheduleCron: "每日 18:00" },
  { id: 5, title: "行业报告自动摘要", taskType: "custom", status: "failed", lastRunAt: "2026-04-08 12:00", scheduleCron: "每周三 12:00" },
];

const typeLabels: Record<string, string> = {
  trend_analysis: "趋势分析",
  competitor_monitor: "竞品监控",
  keyword_tracking: "关键词追踪",
  custom: "自定义",
};

export default function Insights() {
  return (
    <PageShell
      title="数据洞察"
      description="行业趋势分析、竞品监控与关键词追踪"
      icon={<TrendingUp className="h-5 w-5" />}
      action={{ label: "新建任务", onClick: () => toast.info("新建洞察任务功能即将上线") }}
    >
      {/* Trend Chart */}
      <Card className="card-elevated border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">关键词热度趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#a3a3a3" />
              <YAxis tick={{ fontSize: 12 }} stroke="#a3a3a3" />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e5e5e5", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "12px" }} />
              <Line type="monotone" dataKey="ai" stroke="#f97316" strokeWidth={2} dot={false} name="AI" />
              <Line type="monotone" dataKey="opc" stroke="#3b82f6" strokeWidth={2} dot={false} name="一人公司" />
              <Line type="monotone" dataKey="blockchain" stroke="#8b5cf6" strokeWidth={2} dot={false} name="区块链" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insight Tasks */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">洞察任务</h2>
        {mockTasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Card className="card-elevated border-border/30 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {statusIcons[task.status]}
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{typeLabels[task.taskType]}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{task.scheduleCron}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className={`${statusLabels[task.status].variant} border-0 text-[11px]`}>
                      {statusLabels[task.status].label}
                    </Badge>
                    <Button variant="outline" size="sm" className="h-7 text-xs border-border/30" onClick={() => toast.info("查看详情功能即将上线")}>
                      详情
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}
