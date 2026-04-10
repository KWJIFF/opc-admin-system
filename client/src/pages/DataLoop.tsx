import { useState } from "react";
import PageShell from "@/components/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Lightbulb, TrendingUp, BarChart3, Zap, ArrowRight, CheckCircle2, Clock, XCircle, Sparkles, Target, Database } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const suggestionTypes: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  trending_topic: { label: "热点选题", icon: <TrendingUp className="h-3.5 w-3.5" />, color: "text-orange-700", bg: "bg-orange-50" },
  content_gap: { label: "内容缺口", icon: <Target className="h-3.5 w-3.5" />, color: "text-blue-700", bg: "bg-blue-50" },
  performance_insight: { label: "效果洞察", icon: <BarChart3 className="h-3.5 w-3.5" />, color: "text-purple-700", bg: "bg-purple-50" },
  audience_signal: { label: "受众信号", icon: <Sparkles className="h-3.5 w-3.5" />, color: "text-emerald-700", bg: "bg-emerald-50" },
  cross_platform: { label: "跨平台复用", icon: <RefreshCw className="h-3.5 w-3.5" />, color: "text-cyan-700", bg: "bg-cyan-50" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "新建议", color: "bg-blue-100 text-blue-700" },
  reviewing: { label: "评估中", color: "bg-amber-100 text-amber-700" },
  accepted: { label: "已采纳", color: "bg-emerald-100 text-emerald-700" },
  dismissed: { label: "已忽略", color: "bg-gray-100 text-gray-600" },
  converted: { label: "已转化", color: "bg-purple-100 text-purple-700" },
};

const mockSuggestions = [
  {
    id: 1, suggestionType: "trending_topic", title: "AI Agent 创业实战指南",
    description: "近7天「AI Agent」搜索量增长 340%，建议围绕一人公司如何利用 AI Agent 提效撰写系列内容。当前竞品覆盖率低，存在内容蓝海机会。",
    dataSource: { source: "百度指数+知乎热榜", trend: "+340%", competitors: 3 },
    confidence: 92, status: "new", createdAt: "2026-04-10 08:00",
  },
  {
    id: 2, suggestionType: "content_gap", title: "一人公司税务筹划专题缺失",
    description: "分析现有内容库发现，税务筹划类内容仅2篇，但用户搜索和评论中相关需求占比 18%。建议补充系列文章覆盖个体户/有限公司/合伙企业三种形态。",
    dataSource: { source: "站内搜索+评论分析", demand: "18%", existing: 2 },
    confidence: 87, status: "reviewing", createdAt: "2026-04-09 16:00",
  },
  {
    id: 3, suggestionType: "performance_insight", title: "小红书图文互动率显著高于公众号",
    description: "过去30天数据显示，小红书图文平均互动率 8.3%，是公众号的 4.2 倍。建议将公众号长文拆解为小红书系列图文卡片，提升整体矩阵效果。",
    dataSource: { source: "多平台数据对比", xhsRate: "8.3%", mpRate: "2.0%" },
    confidence: 95, status: "accepted", createdAt: "2026-04-08 10:00",
  },
  {
    id: 4, suggestionType: "audience_signal", title: "25-35岁女性创业者关注度上升",
    description: "近期粉丝画像变化显示，25-35岁女性用户占比从 22% 上升至 31%，主要关注副业变现和内容创业方向。建议增加相关内容比重。",
    dataSource: { source: "粉丝画像分析", growth: "+9%", segment: "25-35F" },
    confidence: 78, status: "new", createdAt: "2026-04-10 06:00",
  },
  {
    id: 5, suggestionType: "cross_platform", title: "知乎高赞回答可复用为公众号深度文",
    description: "知乎回答《一人公司如何做到年入百万》获得 2.3k 赞同，建议扩展为公众号深度长文，并同步制作抖音短视频版本，实现内容三端复用。",
    dataSource: { source: "知乎数据", upvotes: 2300, platform: "zhihu" },
    confidence: 88, status: "converted", createdAt: "2026-04-07 14:00",
  },
];

function LoopStats() {
  const stats = [
    { label: "本周建议", value: 12, icon: <Lightbulb className="h-4 w-4" />, color: "text-amber-600" },
    { label: "已采纳", value: 7, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-600" },
    { label: "转化为选题", value: 4, icon: <Zap className="h-4 w-4" />, color: "text-purple-600" },
    { label: "平均置信度", value: "88%", icon: <Target className="h-4 w-4" />, color: "text-blue-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="card-elevated border-border/30 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={s.color}>{s.icon}</span>
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold tracking-tight">{s.value}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function SuggestionCard({ suggestion, index }: { suggestion: typeof mockSuggestions[0]; index: number }) {
  const st = suggestionTypes[suggestion.suggestionType] || { label: suggestion.suggestionType, icon: <Lightbulb className="h-3.5 w-3.5" />, color: "text-gray-700", bg: "bg-gray-50" };
  const sc = statusConfig[suggestion.status] || { label: suggestion.status, color: "bg-gray-100 text-gray-600" };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Card className="card-elevated border-border/30 rounded-2xl hover:shadow-md transition-all duration-200">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl ${st.bg} flex items-center justify-center ${st.color}`}>{st.icon}</div>
              <div>
                <h3 className="font-semibold text-sm">{suggestion.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className={`${st.bg} ${st.color} border-0 text-[10px]`}>{st.label}</Badge>
                  <Badge variant="secondary" className={`${sc.color} border-0 text-[10px]`}>{sc.label}</Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <div className="w-16 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${suggestion.confidence}%` }} />
                </div>
                <span className="text-[10px] font-medium text-primary">{suggestion.confidence}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">置信度</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{suggestion.description}</p>

          {/* Data Source */}
          <div className="bg-muted/20 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Database className="h-3 w-3 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground font-medium">数据来源</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(suggestion.dataSource).map(([key, value]) => (
                <span key={key} className="text-[11px] bg-background rounded-lg px-2 py-0.5 border border-border/30">
                  <span className="text-muted-foreground">{key}:</span> <span className="font-medium">{String(value)}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            {(suggestion.status === "new" || suggestion.status === "reviewing") && (
              <>
                <Button size="sm" className="h-7 text-xs rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground btn-press" onClick={() => toast.success("已转化为选题")}>
                  <ArrowRight className="h-3 w-3 mr-1" />转化为选题
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg border-border/50 btn-press" onClick={() => toast.info("已标记为评估中")}>
                  <Clock className="h-3 w-3 mr-1" />稍后评估
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs rounded-lg text-muted-foreground btn-press" onClick={() => toast.info("已忽略")}>
                  <XCircle className="h-3 w-3 mr-1" />忽略
                </Button>
              </>
            )}
            {suggestion.status === "accepted" && (
              <Button size="sm" className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white btn-press" onClick={() => toast.success("已转化为选题")}>
                <ArrowRight className="h-3 w-3 mr-1" />转化为选题
              </Button>
            )}
            {suggestion.status === "converted" && (
              <span className="text-[11px] text-purple-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />已转化为选题并进入内容工厂</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DataLoop() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredSuggestions = activeTab === "all"
    ? mockSuggestions
    : activeTab === "new"
    ? mockSuggestions.filter(s => s.status === "new")
    : mockSuggestions.filter(s => s.suggestionType === activeTab);

  return (
    <PageShell
      title="数据循环建议"
      description="基于外部情报、账号数据和内容效果的智能内容策略建议，形成数据驱动的内容生产闭环"
      icon={<RefreshCw className="h-5 w-5" />}
      action={{ label: "刷新建议", onClick: () => toast.info("正在分析最新数据...") }}
    >
      <LoopStats />

      {/* Data Loop Diagram */}
      <Card className="card-elevated border-border/30 rounded-2xl mt-5">
        <CardContent className="p-5">
          <h3 className="font-semibold text-sm mb-4">数据循环闭环</h3>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { label: "外部情报采集", icon: "📡", color: "bg-blue-50 text-blue-700" },
              { label: "数据分析", icon: "📊", color: "bg-purple-50 text-purple-700" },
              { label: "智能建议", icon: "💡", color: "bg-amber-50 text-amber-700" },
              { label: "内容生产", icon: "✍️", color: "bg-green-50 text-green-700" },
              { label: "多平台发布", icon: "🚀", color: "bg-orange-50 text-orange-700" },
              { label: "效果数据回流", icon: "🔄", color: "bg-cyan-50 text-cyan-700" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className={`${step.color} rounded-xl px-3 py-2 text-center min-w-[100px]`}>
                  <span className="text-lg block mb-0.5">{step.icon}</span>
                  <p className="text-[10px] font-medium">{step.label}</p>
                </div>
                {i < 5 && <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 mt-5">
        <TabsList className="bg-muted/30 p-1 h-auto rounded-xl flex-wrap">
          <TabsTrigger value="all" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">全部</TabsTrigger>
          <TabsTrigger value="new" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">
            新建议 <Badge variant="secondary" className="ml-1.5 bg-blue-100 text-blue-700 border-0 text-[10px]">{mockSuggestions.filter(s => s.status === "new").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="trending_topic" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">热点选题</TabsTrigger>
          <TabsTrigger value="content_gap" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">内容缺口</TabsTrigger>
          <TabsTrigger value="performance_insight" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">效果洞察</TabsTrigger>
          <TabsTrigger value="audience_signal" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">受众信号</TabsTrigger>
          <TabsTrigger value="cross_platform" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">跨平台复用</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3">
          {filteredSuggestions.length === 0 ? (
            <Card className="border-border/30 rounded-2xl">
              <CardContent className="p-12 text-center">
                <Lightbulb className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">暂无建议</p>
              </CardContent>
            </Card>
          ) : (
            filteredSuggestions.map((suggestion, i) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} index={i} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
