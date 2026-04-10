import { useState } from "react";
import PageShell from "@/components/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, MessageSquare, ThumbsUp, Send, Clock, CheckCircle2, AlertCircle, Zap, TrendingUp, Settings } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const platformConfig: Record<string, { name: string; icon: string; bg: string; color: string }> = {
  wechat_mp: { name: "微信公众号", icon: "💬", bg: "bg-green-50", color: "text-green-700" },
  xiaohongshu: { name: "小红书", icon: "📕", bg: "bg-red-50", color: "text-red-600" },
  douyin: { name: "抖音", icon: "🎵", bg: "bg-gray-100", color: "text-gray-800" },
  bilibili: { name: "B站", icon: "📺", bg: "bg-blue-50", color: "text-blue-600" },
  zhihu: { name: "知乎", icon: "📘", bg: "bg-blue-50", color: "text-blue-700" },
  weibo: { name: "微博", icon: "📢", bg: "bg-orange-50", color: "text-orange-600" },
};

const interactionTypes: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  auto_reply: { label: "自动回复", icon: <MessageSquare className="h-3.5 w-3.5" />, color: "bg-blue-100 text-blue-700" },
  comment_reply: { label: "评论回复", icon: <ThumbsUp className="h-3.5 w-3.5" />, color: "bg-green-100 text-green-700" },
  dm_reply: { label: "私信回复", icon: <Send className="h-3.5 w-3.5" />, color: "bg-purple-100 text-purple-700" },
  content_suggestion: { label: "内容建议", icon: <Zap className="h-3.5 w-3.5" />, color: "bg-amber-100 text-amber-700" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "待审核", color: "bg-amber-100 text-amber-700" },
  approved: { label: "已批准", color: "bg-blue-100 text-blue-700" },
  sent: { label: "已发送", color: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "已拒绝", color: "bg-red-100 text-red-700" },
};

/* Mock interactions for demo */
const mockInteractions = [
  { id: 1, accountId: 1, platform: "wechat_mp", interactionType: "auto_reply", triggerContent: "用户提问：一人公司如何注册？", aiResponse: "一人公司注册流程：1. 确定公司名称和经营范围 2. 准备注册材料（身份证、地址证明等）3. 在工商局网站提交申请 4. 等待审核通过后领取营业执照。详细指南请查看我们的最新文章。", status: "sent", createdAt: "2026-04-10 09:30" },
  { id: 2, accountId: 2, platform: "xiaohongshu", interactionType: "comment_reply", triggerContent: "评论：这个工具太好用了！", aiResponse: "谢谢你的认可！我们一直在优化工具体验，如果你有任何建议也欢迎随时告诉我们 ❤️", status: "pending", createdAt: "2026-04-10 10:15" },
  { id: 3, accountId: 3, platform: "douyin", interactionType: "dm_reply", triggerContent: "私信：请问有合作机会吗？", aiResponse: "感谢你的关注！关于合作事宜，请发送详细需求到我们的商务邮箱 biz@opcs.vip，我们会在24小时内回复。", status: "approved", createdAt: "2026-04-10 11:00" },
  { id: 4, accountId: 5, platform: "zhihu", interactionType: "auto_reply", triggerContent: "邀请回答：AI 对一人公司有什么影响？", aiResponse: "AI 正在深刻改变一人公司的运营模式。从内容创作、客户服务到数据分析，AI 工具让个人创业者能够以极低成本完成过去需要团队才能完成的工作...", status: "pending", createdAt: "2026-04-10 14:20" },
  { id: 5, accountId: 1, platform: "wechat_mp", interactionType: "content_suggestion", triggerContent: "基于近期热点：AI Agent 概念持续升温", aiResponse: "建议撰写文章《AI Agent 如何赋能一人公司：从概念到实践》，结合当前热点分析 AI Agent 在内容创作、客户管理、财务分析等场景的应用。", status: "approved", createdAt: "2026-04-10 08:00" },
];

function StatsOverview() {
  const stats = [
    { label: "今日互动", value: 47, change: "+12%", icon: <MessageSquare className="h-4 w-4" />, color: "text-blue-600" },
    { label: "AI 回复", value: 23, change: "+8%", icon: <Bot className="h-4 w-4" />, color: "text-purple-600" },
    { label: "待审核", value: 5, change: "", icon: <Clock className="h-4 w-4" />, color: "text-amber-600" },
    { label: "回复率", value: "94%", change: "+3%", icon: <TrendingUp className="h-4 w-4" />, color: "text-emerald-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="card-elevated border-border/30 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={s.color}>{s.icon}</span>
                {s.change && <span className="text-[10px] text-emerald-600 font-medium">{s.change}</span>}
              </div>
              <p className="text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function InteractionCard({ interaction, index }: { interaction: typeof mockInteractions[0]; index: number }) {
  const pc = platformConfig[interaction.platform] || { name: interaction.platform, icon: "📱", bg: "bg-gray-50", color: "text-gray-600" };
  const it = interactionTypes[interaction.interactionType] || { label: interaction.interactionType, icon: <Bot className="h-3.5 w-3.5" />, color: "bg-gray-100 text-gray-600" };
  const sc = statusConfig[interaction.status] || { label: interaction.status, color: "bg-gray-100 text-gray-600" };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Card className="card-elevated border-border/30 rounded-2xl hover:shadow-md transition-all duration-200">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg ${pc.bg} flex items-center justify-center text-lg`}>{pc.icon}</div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`${it.color} border-0 text-[10px] gap-1`}>{it.icon}{it.label}</Badge>
                  <Badge variant="secondary" className={`${sc.color} border-0 text-[10px]`}>{sc.label}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{pc.name} · {interaction.createdAt}</p>
              </div>
            </div>
          </div>

          {/* Trigger */}
          <div className="bg-muted/30 rounded-xl p-3 mb-3">
            <p className="text-[10px] text-muted-foreground mb-1 font-medium">触发内容</p>
            <p className="text-sm text-foreground">{interaction.triggerContent}</p>
          </div>

          {/* AI Response */}
          <div className="bg-primary/[0.03] border border-primary/10 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Bot className="h-3 w-3 text-primary" />
              <p className="text-[10px] text-primary font-medium">AI 生成回复</p>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{interaction.aiResponse}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            {interaction.status === "pending" && (
              <>
                <Button size="sm" className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white btn-press" onClick={() => toast.success("已批准并发送")}>
                  <CheckCircle2 className="h-3 w-3 mr-1" />批准发送
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg border-border/50 btn-press" onClick={() => toast.info("已编辑回复")}>
                  编辑回复
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs rounded-lg text-red-500 hover:text-red-600 btn-press" onClick={() => toast.info("已拒绝")}>
                  <AlertCircle className="h-3 w-3 mr-1" />拒绝
                </Button>
              </>
            )}
            {interaction.status === "approved" && (
              <Button size="sm" className="h-7 text-xs rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground btn-press" onClick={() => toast.success("已发送")}>
                <Send className="h-3 w-3 mr-1" />立即发送
              </Button>
            )}
            {interaction.status === "sent" && (
              <span className="text-[11px] text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />已成功发送</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AiInteractions() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredInteractions = activeTab === "all"
    ? mockInteractions
    : activeTab === "pending"
    ? mockInteractions.filter(i => i.status === "pending")
    : mockInteractions.filter(i => i.interactionType === activeTab);

  return (
    <PageShell
      title="AI 互动管理"
      description="AI 驱动的多平台互动自动化管理，审核和优化 AI 生成的回复"
      icon={<Bot className="h-5 w-5" />}
      action={{ label: "互动策略设置", onClick: () => toast.info("互动策略设置即将上线") }}
    >
      <StatsOverview />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 mt-5">
        <TabsList className="bg-muted/30 p-1 h-auto rounded-xl flex-wrap">
          <TabsTrigger value="all" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">全部</TabsTrigger>
          <TabsTrigger value="pending" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">
            待审核 <Badge variant="secondary" className="ml-1.5 bg-amber-100 text-amber-700 border-0 text-[10px]">{mockInteractions.filter(i => i.status === "pending").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="auto_reply" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">自动回复</TabsTrigger>
          <TabsTrigger value="comment_reply" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">评论回复</TabsTrigger>
          <TabsTrigger value="dm_reply" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">私信回复</TabsTrigger>
          <TabsTrigger value="content_suggestion" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">内容建议</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3">
          {filteredInteractions.length === 0 ? (
            <Card className="border-border/30 rounded-2xl">
              <CardContent className="p-12 text-center">
                <Bot className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">暂无互动记录</p>
              </CardContent>
            </Card>
          ) : (
            filteredInteractions.map((interaction, i) => (
              <InteractionCard key={interaction.id} interaction={interaction} index={i} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* AI Strategy Card */}
      <Card className="card-elevated border-border/30 rounded-2xl mt-6">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI 互动策略</h3>
              <p className="text-[11px] text-muted-foreground">配置各平台的 AI 自动回复规则和审核流程</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "自动回复", desc: "常见问题自动回复，无需审核", status: "已启用", color: "text-emerald-600" },
              { label: "评论管理", desc: "AI 分析评论情感，智能回复", status: "审核模式", color: "text-amber-600" },
              { label: "私信回复", desc: "商务咨询自动引导至邮箱", status: "已启用", color: "text-emerald-600" },
            ].map((strategy) => (
              <div key={strategy.label} className="bg-muted/20 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{strategy.label}</p>
                  <span className={`text-[10px] font-medium ${strategy.color}`}>{strategy.status}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{strategy.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
