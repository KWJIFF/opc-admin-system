import PageShell from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Database, Server, Wifi, HardDrive, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const systemMetrics = [
  { label: "API 响应", value: "45ms", status: "healthy", icon: Wifi, description: "平均响应时间" },
  { label: "数据库", value: "正常", status: "healthy", icon: Database, description: "连接池 8/20" },
  { label: "服务器", value: "运行中", status: "healthy", icon: Server, description: "CPU 23% / 内存 45%" },
  { label: "存储", value: "12.5 GB", status: "healthy", icon: HardDrive, description: "已用 / 50 GB" },
];

const uptimeData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  requests: Math.floor(Math.random() * 200 + 50),
  errors: Math.floor(Math.random() * 5),
}));

const recentLogs = [
  { time: "10:30:15", level: "INFO", message: "用户 zhangsan 登录成功", source: "auth" },
  { time: "10:28:42", level: "INFO", message: "信号采集任务完成，新增 12 条", source: "scheduler" },
  { time: "10:25:18", level: "WARN", message: "小红书 API 响应超时，已重试", source: "publish" },
  { time: "10:20:05", level: "INFO", message: "周报生成工作流执行成功", source: "workflow" },
  { time: "10:15:33", level: "INFO", message: "数据库备份完成", source: "system" },
  { time: "10:10:01", level: "ERROR", message: "B站视频上传失败：文件过大", source: "publish" },
  { time: "10:05:22", level: "INFO", message: "竞品监控任务启动", source: "scheduler" },
  { time: "10:00:00", level: "INFO", message: "定时健康检查通过", source: "system" },
];

const levelColors: Record<string, string> = {
  INFO: "text-blue-600 bg-blue-50",
  WARN: "text-amber-600 bg-amber-50",
  ERROR: "text-red-600 bg-red-50",
};

const statusColors: Record<string, string> = {
  healthy: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
};

export default function Monitor() {
  return (
    <PageShell title="系统监控" description="系统健康状态与运行日志" icon={<Activity className="h-5 w-5" />}>
      {/* System Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                  <div className={`w-2 h-2 rounded-full ${statusColors[metric.status]}`} />
                </div>
                <p className="text-lg font-bold text-foreground">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{metric.label}</p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">{metric.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Request Chart */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">24 小时请求量</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={uptimeData}>
              <defs>
                <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#a3a3a3" interval={3} />
              <YAxis tick={{ fontSize: 11 }} stroke="#a3a3a3" />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e5e5e5", fontSize: "12px" }} />
              <Area type="monotone" dataKey="requests" stroke="#f97316" strokeWidth={2} fill="url(#colorReqs)" name="请求数" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* System Logs */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              系统日志
            </CardTitle>
            <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[11px]">实时</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30 max-h-[400px] overflow-y-auto">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                <span className="text-[11px] text-muted-foreground font-mono shrink-0 mt-0.5">{log.time}</span>
                <Badge variant="secondary" className={`${levelColors[log.level]} border-0 text-[10px] font-mono shrink-0`}>
                  {log.level}
                </Badge>
                <span className="text-sm text-foreground/80 flex-1">{log.message}</span>
                <span className="text-[11px] text-muted-foreground/60 shrink-0">{log.source}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
