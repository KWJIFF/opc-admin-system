import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Clock, Play, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Activity, Zap, Shield, FileText, Brain, BookOpen, Scale, Target,
  BarChart3, Wrench, Newspaper, Loader2,
} from "lucide-react";

const CATEGORY_META: Record<string, { label: string; icon: typeof Newspaper; color: string }> = {
  news: { label: "今日快讯", icon: Newspaper, color: "bg-blue-100 text-blue-700" },
  thoughts: { label: "思想前沿", icon: Brain, color: "bg-purple-100 text-purple-700" },
  research: { label: "深度研究", icon: BookOpen, color: "bg-indigo-100 text-indigo-700" },
  policy: { label: "政策风向", icon: Scale, color: "bg-amber-100 text-amber-700" },
  cases: { label: "实战拆解", icon: Target, color: "bg-green-100 text-green-700" },
  reports: { label: "深度报告", icon: BarChart3, color: "bg-orange-100 text-orange-700" },
  toolkit: { label: "工具图谱", icon: Wrench, color: "bg-teal-100 text-teal-700" },
};

function cronToReadable(expr: string, category?: string): string {
  const cat = category ? CATEGORY_META[category]?.label || category : "";
  // Parse common patterns
  if (expr === "0 0 * * *") return `${cat} 每天早8:00`;
  if (expr === "0 4 * * *") return `${cat} 每天中12:00`;
  if (expr === "0 10 * * *") return `${cat} 每天晚18:00`;
  if (expr === "0 0 * * 1") return `${cat} 每周一早8:00`;
  if (expr === "0 0 * * 4") return `${cat} 每周四早8:00`;
  if (expr === "0 4 * * 2") return `${cat} 每周二中12:00`;
  if (expr === "0 4 * * 6") return `${cat} 每周六中12:00`;
  if (expr === "0 0 * * 5") return `${cat} 每周五早8:00`;
  if (expr === "0 2,8,14,20 * * *") return "每6小时";
  if (expr === "0 19 * * *") return "每天凌晨3:00";
  return expr;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "success": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" />成功</Badge>;
    case "failed": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />失败</Badge>;
    case "running": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Loader2 className="w-3 h-3 mr-1 animate-spin" />运行中</Badge>;
    case "skipped": return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100"><AlertTriangle className="w-3 h-3 mr-1" />跳过</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default function SchedulerPage() {

  const [triggeringCategory, setTriggeringCategory] = useState<string | null>(null);
  const [triggeringHealth, setTriggeringHealth] = useState(false);

  const { data: status, isLoading, refetch } = trpc.scheduler.status.useQuery();
  const { data: logs } = trpc.scheduler.logs.useQuery({ limit: 50 });

  const triggerContent = trpc.scheduler.triggerContent.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      setTriggeringCategory(null);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
      setTriggeringCategory(null);
    },
  });

  const triggerHealth = trpc.scheduler.triggerHealthCheck.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      setTriggeringHealth(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
      setTriggeringHealth(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            AI 自动化任务中心
          </h1>
          <p className="text-muted-foreground mt-1">管理 AI 内容自动生成、网站健康检查和自动维护任务</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1" />刷新
        </Button>
      </div>

      {/* 状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${status?.running ? "bg-green-100" : "bg-red-100"}`}>
                <Activity className={`w-5 h-5 ${status?.running ? "text-green-600" : "text-red-600"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">系统状态</p>
                <p className="text-lg font-bold">{status?.running ? "运行中" : "已停止"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">注册任务</p>
                <p className="text-lg font-bold">{status?.totalJobs || 0} 个</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">成功执行</p>
                <p className="text-lg font-bold">{status?.stats?.successes || 0} 次</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">失败次数</p>
                <p className="text-lg font-bold">{status?.stats?.failures || 0} 次</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 内容生成任务 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" />AI 内容自动生成</CardTitle>
          <CardDescription>每个板块按设定频率自动调用千问大模型生成文章并发布到前台</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const Icon = meta.icon;
              const jobs = status?.jobs?.filter((j: any) => j.category === key) || [];
              const isTriggering = triggeringCategory === key;
              return (
                <div key={key} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{meta.label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 mb-3">
                    {jobs.map((j: any, i: number) => (
                      <div key={i} className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {cronToReadable(j.expression, key)}
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    disabled={isTriggering}
                    onClick={() => {
                      setTriggeringCategory(key);
                      triggerContent.mutate({ category: key });
                    }}
                  >
                    {isTriggering ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
                    {isTriggering ? "生成中..." : "立即生成"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 系统维护任务 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />系统维护与健康检查</CardTitle>
          <CardDescription>AI 自动检测网站健康状态、数据库连接、内容新鲜度，发现问题自动生成修复建议</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-emerald-100 text-emerald-700">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm">健康检查</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">每6小时自动检查数据库、内容新鲜度、内存使用等</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                disabled={triggeringHealth}
                onClick={() => {
                  setTriggeringHealth(true);
                  triggerHealth.mutate();
                }}
              >
                {triggeringHealth ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
                {triggeringHealth ? "检查中..." : "立即检查"}
              </Button>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-violet-100 text-violet-700">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm">安全扫描</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">每天凌晨3点自动扫描错误日志、检测异常</p>
              <Badge variant="outline" className="text-xs">自动运行</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 运行日志 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" />运行日志</CardTitle>
          <CardDescription>最近 50 条任务执行记录</CardDescription>
        </CardHeader>
        <CardContent>
          {(!logs || logs.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无运行记录</p>
              <p className="text-xs mt-1">定时任务启动后，执行记录将在此显示</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {logs.map((log: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <StatusBadge status={log.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{log.jobName}</span>
                      <Badge variant="outline" className="text-xs">{log.jobType}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.message}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                    <div>{new Date(log.startedAt).toLocaleString("zh-CN")}</div>
                    {log.durationMs && <div className="mt-0.5">{log.durationMs}ms</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 更新策略说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📋 内容更新策略</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium">板块</th>
                  <th className="text-left py-2 pr-4 font-medium">更新频率</th>
                  <th className="text-left py-2 pr-4 font-medium">更新时间（北京时间）</th>
                  <th className="text-left py-2 font-medium">内容特点</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b"><td className="py-2 pr-4 font-medium text-foreground">今日快讯</td><td className="py-2 pr-4">每天3次</td><td className="py-2 pr-4">8:00 / 12:00 / 18:00</td><td className="py-2">简洁快讯，800-1200字</td></tr>
                <tr className="border-b"><td className="py-2 pr-4 font-medium text-foreground">思想前沿</td><td className="py-2 pr-4">每天1次</td><td className="py-2 pr-4">8:00</td><td className="py-2">深度思考，1500-2500字</td></tr>
                <tr className="border-b"><td className="py-2 pr-4 font-medium text-foreground">深度研究</td><td className="py-2 pr-4">每周2次</td><td className="py-2 pr-4">周一、周四 8:00</td><td className="py-2">学术研究，3000-5000字</td></tr>
                <tr className="border-b"><td className="py-2 pr-4 font-medium text-foreground">政策风向</td><td className="py-2 pr-4">每天1次</td><td className="py-2 pr-4">12:00</td><td className="py-2">政策解读，1500-2500字</td></tr>
                <tr className="border-b"><td className="py-2 pr-4 font-medium text-foreground">实战拆解</td><td className="py-2 pr-4">每天1次</td><td className="py-2 pr-4">18:00</td><td className="py-2">案例分析，1500-2500字</td></tr>
                <tr className="border-b"><td className="py-2 pr-4 font-medium text-foreground">深度报告</td><td className="py-2 pr-4">每周1次</td><td className="py-2 pr-4">周五 8:00</td><td className="py-2">行业报告，3000-5000字</td></tr>
                <tr><td className="py-2 pr-4 font-medium text-foreground">工具图谱</td><td className="py-2 pr-4">每周2次</td><td className="py-2 pr-4">周二、周六 12:00</td><td className="py-2">工具评测，1500-2500字</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
