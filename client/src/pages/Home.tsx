import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Radar,
  Lightbulb,
  Send,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const stats = [
  { label: "信号总数", value: "1,284", change: "+12%", up: true, icon: Radar, color: "text-orange-500", bg: "bg-orange-50" },
  { label: "选题数", value: "326", change: "+8%", up: true, icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-50" },
  { label: "已发布", value: "189", change: "+23%", up: true, icon: Send, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "报告数", value: "47", change: "-3%", up: false, icon: BarChart3, color: "text-blue-500", bg: "bg-blue-50" },
];

const trendData = [
  { name: "1月", signals: 120, topics: 45, published: 28 },
  { name: "2月", signals: 145, topics: 52, published: 35 },
  { name: "3月", signals: 168, topics: 61, published: 42 },
  { name: "4月", signals: 192, topics: 58, published: 48 },
  { name: "5月", signals: 210, topics: 72, published: 55 },
  { name: "6月", signals: 235, topics: 68, published: 62 },
];

const weeklyData = [
  { name: "周一", count: 18 },
  { name: "周二", count: 24 },
  { name: "周三", count: 32 },
  { name: "周四", count: 28 },
  { name: "周五", count: 35 },
  { name: "周六", count: 12 },
  { name: "周日", count: 8 },
];

const pipelineStages = [
  { label: "待处理信号", count: 42, status: "warning" as const },
  { label: "选题审核中", count: 8, status: "info" as const },
  { label: "内容撰写中", count: 15, status: "info" as const },
  { label: "待审核", count: 6, status: "warning" as const },
  { label: "待发布", count: 12, status: "success" as const },
];

const recentActivities = [
  { action: "发布了文章", target: "《2026年一人公司趋势报告》", time: "10 分钟前", type: "publish" },
  { action: "通过了审核", target: "《AI 辅助内容生产实践》", time: "25 分钟前", type: "review" },
  { action: "新增信号", target: "OpenAI 发布新模型 GPT-5", time: "1 小时前", type: "signal" },
  { action: "创建选题", target: "《深度解读：中国 AI 监管新规》", time: "2 小时前", type: "topic" },
  { action: "发布了周报", target: "第 14 周运营周报", time: "3 小时前", type: "report" },
];

const statusColors = {
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
  success: "bg-emerald-100 text-emerald-700",
};

const activityIcons = {
  publish: <Send className="h-3.5 w-3.5 text-emerald-500" />,
  review: <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />,
  signal: <Radar className="h-3.5 w-3.5 text-orange-500" />,
  topic: <Lightbulb className="h-3.5 w-3.5 text-amber-500" />,
  report: <BarChart3 className="h-3.5 w-3.5 text-purple-500" />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Home() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">仪表盘</h1>
        <p className="text-sm text-muted-foreground mt-1">内容运营全链路数据总览</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.up ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={`text-xs font-medium ${stat.up ? "text-emerald-600" : "text-red-600"}`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">vs 上月</span>
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pipeline Health */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              内容链路健康状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {pipelineStages.map((stage, i) => (
                <div key={stage.label} className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-muted/40 min-w-[120px]">
                    <span className="text-xs text-muted-foreground">{stage.label}</span>
                    <Badge variant="secondary" className={`${statusColors[stage.status]} border-0 font-semibold`}>
                      {stage.count}
                    </Badge>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <div className="text-muted-foreground/30 text-lg shrink-0">→</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">内容产出趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorSignals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPublished" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#a3a3a3" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#a3a3a3" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #e5e5e5",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="signals" stroke="#f97316" strokeWidth={2} fill="url(#colorSignals)" name="信号" />
                  <Area type="monotone" dataKey="published" stroke="#10b981" strokeWidth={2} fill="url(#colorPublished)" name="发布" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">本周发布量</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#a3a3a3" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#a3a3a3" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #e5e5e5",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} name="发布数" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              最近活动
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/40 transition-colors">
                  <div className="p-1.5 rounded-lg bg-muted/60 shrink-0">
                    {activityIcons[activity.type as keyof typeof activityIcons]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
