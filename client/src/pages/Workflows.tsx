import PageShell from "@/components/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Workflow, Play, Zap, Clock, MoreHorizontal,
  CheckCircle2, Circle, AlertCircle, ChevronRight,
  Timer, BarChart3, Settings2, History, Rss, Brain, FileCheck,
  Send, Search, FileText, Globe, Bot, Database, Bell, Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

/* ── Step Icon Map ── */
const stepIconMap: Record<string, React.ReactNode> = {
  "RSS 抓取": <Rss className="h-3.5 w-3.5" />,
  "AI 分类": <Brain className="h-3.5 w-3.5" />,
  "入库": <Database className="h-3.5 w-3.5" />,
  "通知": <Bell className="h-3.5 w-3.5" />,
  "内容检测": <Search className="h-3.5 w-3.5" />,
  "AI 评分": <Brain className="h-3.5 w-3.5" />,
  "条件判断": <Filter className="h-3.5 w-3.5" />,
  "推送审核": <FileCheck className="h-3.5 w-3.5" />,
  "数据汇总": <BarChart3 className="h-3.5 w-3.5" />,
  "AI 撰写": <Brain className="h-3.5 w-3.5" />,
  "格式化": <FileText className="h-3.5 w-3.5" />,
  "保存草稿": <Database className="h-3.5 w-3.5" />,
  "获取排期": <Timer className="h-3.5 w-3.5" />,
  "格式适配": <Settings2 className="h-3.5 w-3.5" />,
  "API 发布": <Send className="h-3.5 w-3.5" />,
  "状态回写": <Database className="h-3.5 w-3.5" />,
  "抓取更新": <Globe className="h-3.5 w-3.5" />,
  "AI 摘要": <Brain className="h-3.5 w-3.5" />,
  "对比分析": <BarChart3 className="h-3.5 w-3.5" />,
  "生成报告": <FileText className="h-3.5 w-3.5" />,
  "关键词匹配": <Search className="h-3.5 w-3.5" />,
  "AI 生成选题": <Brain className="h-3.5 w-3.5" />,
  "评审打分": <FileCheck className="h-3.5 w-3.5" />,
  "推送选题池": <Send className="h-3.5 w-3.5" />,
};

/* ── Trigger Type Config ── */
const triggerConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  schedule: { label: "定时触发", icon: <Clock className="h-3.5 w-3.5" />, color: "text-blue-600 bg-blue-50" },
  event: { label: "事件触发", icon: <Zap className="h-3.5 w-3.5" />, color: "text-amber-600 bg-amber-50" },
  manual: { label: "手动触发", icon: <Play className="h-3.5 w-3.5" />, color: "text-purple-600 bg-purple-50" },
  webhook: { label: "Webhook", icon: <Globe className="h-3.5 w-3.5" />, color: "text-emerald-600 bg-emerald-50" },
};

/* ── Mock Workflows ── */
const mockWorkflows = [
  {
    id: 1, name: "信号自动采集", description: "从 RSS 源和 API 自动采集行业信号，分类后入库并通知相关人员",
    status: "active" as const, trigger: "schedule", schedule: "每小时执行",
    runCount: 1284, successRate: 98.5, avgDuration: "12s", lastRunAt: "2026-04-09 10:00", lastRunStatus: "success",
    steps: [
      { name: "RSS 抓取", status: "completed", duration: "3s" },
      { name: "AI 分类", status: "completed", duration: "5s" },
      { name: "入库", status: "completed", duration: "2s" },
      { name: "通知", status: "completed", duration: "2s" },
    ],
  },
  {
    id: 2, name: "内容审核自动化", description: "内容提交后自动触发 AI 预审，评分达标后推送人工审核队列",
    status: "active" as const, trigger: "event", schedule: "内容提交时触发",
    runCount: 326, successRate: 95.2, avgDuration: "8s", lastRunAt: "2026-04-09 09:30", lastRunStatus: "success",
    steps: [
      { name: "内容检测", status: "completed", duration: "2s" },
      { name: "AI 评分", status: "completed", duration: "3s" },
      { name: "条件判断", status: "completed", duration: "1s" },
      { name: "推送审核", status: "completed", duration: "2s" },
    ],
  },
  {
    id: 3, name: "周报自动生成", description: "每周一 08:00 自动汇总上周运营数据，AI 撰写周报草稿",
    status: "active" as const, trigger: "schedule", schedule: "每周一 08:00",
    runCount: 14, successRate: 100, avgDuration: "45s", lastRunAt: "2026-04-07 08:00", lastRunStatus: "success",
    steps: [
      { name: "数据汇总", status: "completed", duration: "10s" },
      { name: "AI 撰写", status: "completed", duration: "25s" },
      { name: "格式化", status: "completed", duration: "5s" },
      { name: "保存草稿", status: "completed", duration: "5s" },
    ],
  },
  {
    id: 4, name: "多平台定时发布", description: "审核通过的内容按排期自动适配格式并发布到各平台",
    status: "inactive" as const, trigger: "schedule", schedule: "每日 09:00 / 12:00 / 18:00",
    runCount: 89, successRate: 91.0, avgDuration: "30s", lastRunAt: "2026-04-06 14:00", lastRunStatus: "failed",
    steps: [
      { name: "获取排期", status: "completed", duration: "2s" },
      { name: "格式适配", status: "completed", duration: "8s" },
      { name: "API 发布", status: "failed", duration: "15s" },
      { name: "状态回写", status: "pending", duration: "-" },
    ],
  },
  {
    id: 5, name: "竞品内容监控", description: "每日定时监控竞品公众号和网站更新，生成对比摘要报告",
    status: "active" as const, trigger: "schedule", schedule: "每日 07:00",
    runCount: 52, successRate: 96.1, avgDuration: "60s", lastRunAt: "2026-04-09 07:00", lastRunStatus: "success",
    steps: [
      { name: "抓取更新", status: "completed", duration: "20s" },
      { name: "AI 摘要", status: "completed", duration: "25s" },
      { name: "对比分析", status: "completed", duration: "10s" },
      { name: "生成报告", status: "completed", duration: "5s" },
    ],
  },
  {
    id: 6, name: "智能选题推荐", description: "基于信号库热度和趋势，AI 自动生成选题建议并推送到选题池",
    status: "draft" as const, trigger: "schedule", schedule: "每日 09:00",
    runCount: 0, successRate: 0, avgDuration: "-", lastRunAt: "-", lastRunStatus: "pending",
    steps: [
      { name: "关键词匹配", status: "pending", duration: "-" },
      { name: "AI 生成选题", status: "pending", duration: "-" },
      { name: "评审打分", status: "pending", duration: "-" },
      { name: "推送选题池", status: "pending", duration: "-" },
    ],
  },
];

/* ── Recent Runs ── */
const recentRuns = [
  { id: 1, workflowName: "信号自动采集", status: "success", startedAt: "2026-04-09 10:00:00", duration: "11s", stepsCompleted: "4/4" },
  { id: 2, workflowName: "内容审核自动化", status: "success", startedAt: "2026-04-09 09:30:12", duration: "7s", stepsCompleted: "4/4" },
  { id: 3, workflowName: "信号自动采集", status: "success", startedAt: "2026-04-09 09:00:00", duration: "13s", stepsCompleted: "4/4" },
  { id: 4, workflowName: "竞品内容监控", status: "success", startedAt: "2026-04-09 07:00:00", duration: "58s", stepsCompleted: "4/4" },
  { id: 5, workflowName: "多平台定时发布", status: "failed", startedAt: "2026-04-06 14:00:00", duration: "25s", stepsCompleted: "2/4" },
  { id: 6, workflowName: "信号自动采集", status: "success", startedAt: "2026-04-09 08:00:00", duration: "12s", stepsCompleted: "4/4" },
  { id: 7, workflowName: "周报自动生成", status: "success", startedAt: "2026-04-07 08:00:00", duration: "43s", stepsCompleted: "4/4" },
  { id: 8, workflowName: "内容审核自动化", status: "success", startedAt: "2026-04-09 08:45:30", duration: "9s", stepsCompleted: "4/4" },
];

/* ── Status Config ── */
const statusConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  active: { label: "运行中", color: "text-emerald-700 bg-emerald-50 border-emerald-200", dotColor: "bg-emerald-500" },
  inactive: { label: "已暂停", color: "text-gray-600 bg-gray-50 border-gray-200", dotColor: "bg-gray-400" },
  draft: { label: "草稿", color: "text-amber-700 bg-amber-50 border-amber-200", dotColor: "bg-amber-500" },
};

const stepStatusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  completed: { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  running: { icon: <Play className="h-4 w-4" />, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  failed: { icon: <AlertCircle className="h-4 w-4" />, color: "text-red-600", bg: "bg-red-50 border-red-200" },
  pending: { icon: <Circle className="h-4 w-4" />, color: "text-gray-400", bg: "bg-gray-50 border-gray-200" },
};

const runStatusConfig: Record<string, { label: string; color: string }> = {
  success: { label: "成功", color: "text-emerald-700 bg-emerald-50" },
  failed: { label: "失败", color: "text-red-700 bg-red-50" },
  running: { label: "执行中", color: "text-blue-700 bg-blue-50" },
};

/* ── Overview Stats ── */
function WorkflowStats() {
  const active = mockWorkflows.filter(w => w.status === "active").length;
  const totalRuns = mockWorkflows.reduce((s, w) => s + w.runCount, 0);
  const avgSuccess = mockWorkflows.filter(w => w.runCount > 0).reduce((s, w) => s + w.successRate, 0) / mockWorkflows.filter(w => w.runCount > 0).length;

  const stats = [
    { label: "活跃工作流", value: `${active}/${mockWorkflows.length}`, icon: <Zap className="h-4 w-4 text-primary" /> },
    { label: "总执行次数", value: totalRuns.toLocaleString(), icon: <Play className="h-4 w-4 text-blue-600" /> },
    { label: "平均成功率", value: `${avgSuccess.toFixed(1)}%`, icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" /> },
    { label: "今日执行", value: "18", icon: <Timer className="h-4 w-4 text-amber-600" /> },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="card-elevated border-border/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Step Pipeline Visualization ── */
function StepPipeline({ steps }: { steps: typeof mockWorkflows[0]["steps"] }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {steps.map((step, si) => {
        const sc = stepStatusConfig[step.status];
        const icon = stepIconMap[step.name];
        return (
          <div key={si} className="flex items-center shrink-0">
            {/* Step Node */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${sc.bg} transition-all`}>
              <div className={`${sc.color} shrink-0`}>
                {icon || sc.icon}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-medium ${sc.color}`}>{step.name}</p>
                {step.duration !== "-" && (
                  <p className="text-[10px] text-muted-foreground">{step.duration}</p>
                )}
              </div>
            </div>
            {/* Connector Arrow */}
            {si < steps.length - 1 && (
              <div className="flex items-center px-1 shrink-0">
                <div className={`w-4 h-px ${step.status === "completed" ? "bg-emerald-300" : step.status === "failed" ? "bg-red-300" : "bg-gray-200"}`} />
                <ChevronRight className={`h-3 w-3 -ml-0.5 ${step.status === "completed" ? "text-emerald-400" : step.status === "failed" ? "text-red-400" : "text-gray-300"}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Workflow Card ── */
function WorkflowCard({ workflow, index }: { workflow: typeof mockWorkflows[0]; index: number }) {
  const sc = statusConfig[workflow.status];
  const tc = triggerConfig[workflow.trigger];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="card-elevated border-border/30 hover:shadow-md transition-all overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-5 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-foreground">{workflow.name}</h3>
                      <Badge variant="outline" className={`${sc.color} border text-[10px] px-1.5 py-0`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor} mr-1 inline-block`} />
                        {sc.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{workflow.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={workflow.status === "active"}
                  onCheckedChange={() => toast.info("状态切换功能即将上线")}
                  className="scale-90"
                />
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg btn-press" onClick={() => toast.info("功能即将上线")}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Trigger & Metrics Row */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium ${tc.color}`}>
                {tc.icon}
                <span>{tc.label}</span>
                <span className="text-[10px] opacity-70 ml-0.5">· {workflow.schedule}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Play className="h-3 w-3" />{workflow.runCount} 次</span>
                {workflow.successRate > 0 && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {workflow.successRate}%
                  </span>
                )}
                {workflow.avgDuration !== "-" && (
                  <span className="flex items-center gap-1"><Timer className="h-3 w-3" />平均 {workflow.avgDuration}</span>
                )}
              </div>
            </div>
          </div>

          {/* Step Pipeline */}
          <div className="px-5 pb-2">
            <StepPipeline steps={workflow.steps} />
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-muted/20 border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>上次执行: {workflow.lastRunAt}</span>
              {workflow.lastRunStatus !== "pending" && (
                <Badge variant="secondary" className={`${runStatusConfig[workflow.lastRunStatus]?.color} border-0 text-[10px] px-1.5 py-0`}>
                  {runStatusConfig[workflow.lastRunStatus]?.label}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-primary"
                onClick={() => toast.info("手动执行功能即将上线")}
              >
                <Play className="h-3 w-3 mr-1" />
                执行
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-primary"
                onClick={() => toast.info("执行历史功能即将上线")}
              >
                <History className="h-3 w-3 mr-1" />
                历史
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-primary"
                onClick={() => toast.info("编辑功能即将上线")}
              >
                <Settings2 className="h-3 w-3 mr-1" />
                编辑
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function Workflows() {
  return (
    <PageShell
      title="工作流"
      description="自动化工作流编排与任务管理"
      icon={<Workflow className="h-5 w-5" />}
      action={{ label: "新建工作流", onClick: () => toast.info("工作流编辑器即将上线") }}
    >
      <Tabs defaultValue="workflows" className="space-y-5">
        <TabsList className="bg-muted/25 p-1 h-auto">
          <TabsTrigger value="workflows" className="text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm px-5 py-2">
            工作流列表
          </TabsTrigger>
          <TabsTrigger value="history" className="text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm px-5 py-2">
            执行历史
          </TabsTrigger>
        </TabsList>

        {/* ── Workflows Tab ── */}
        <TabsContent value="workflows" className="space-y-5">
          <WorkflowStats />
          <div className="space-y-3">
            {mockWorkflows.map((wf, i) => (
              <WorkflowCard key={wf.id} workflow={wf} index={i} />
            ))}
          </div>
        </TabsContent>

        {/* ── History Tab ── */}
        <TabsContent value="history" className="space-y-4">
          <Card className="card-elevated border-border/30">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 bg-muted/30">
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">工作流</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">状态</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">开始时间</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">耗时</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">步骤</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRuns.map((run, i) => (
                      <motion.tr
                        key={run.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Bot className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="font-medium text-foreground text-xs">{run.workflowName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant="secondary" className={`${runStatusConfig[run.status]?.color} border-0 text-[10px]`}>
                            {runStatusConfig[run.status]?.label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{run.startedAt}</td>
                        <td className="px-5 py-3 text-xs text-foreground font-medium">{run.duration}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{run.stepsCompleted}</td>
                        <td className="px-5 py-3 text-right">
                          <Button variant="ghost" size="sm" className="h-6 text-[11px] text-muted-foreground hover:text-primary" onClick={() => toast.info("查看详情功能即将上线")}>
                            详情 <ChevronRight className="h-3 w-3 ml-0.5" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
