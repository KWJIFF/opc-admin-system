import PageShell from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Share2, ExternalLink, MoreHorizontal, Plus, Upload, FileText,
  Eye, RefreshCw, Settings, Copy, Trash2, Layout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

/* ── Platform Config ── */
const platformConfig: Record<string, { name: string; emoji: string; color: string; bg: string; gradient: string }> = {
  wechat_mp: { name: "微信公众号", emoji: "微", color: "text-green-700", bg: "bg-green-50", gradient: "from-green-500 to-green-600" },
  xiaohongshu: { name: "小红书", emoji: "红", color: "text-red-700", bg: "bg-red-50", gradient: "from-red-500 to-red-600" },
  douyin: { name: "抖音", emoji: "抖", color: "text-gray-800", bg: "bg-gray-50", gradient: "from-gray-700 to-gray-900" },
  bilibili: { name: "B站", emoji: "B", color: "text-blue-700", bg: "bg-blue-50", gradient: "from-blue-400 to-blue-600" },
  zhihu: { name: "知乎", emoji: "知", color: "text-blue-700", bg: "bg-blue-50", gradient: "from-blue-500 to-blue-700" },
  weibo: { name: "微博", emoji: "博", color: "text-orange-700", bg: "bg-orange-50", gradient: "from-orange-500 to-red-500" },
  toutiao: { name: "头条号", emoji: "头", color: "text-red-600", bg: "bg-red-50", gradient: "from-red-500 to-red-600" },
  baijiahao: { name: "百家号", emoji: "百", color: "text-blue-600", bg: "bg-blue-50", gradient: "from-blue-500 to-blue-600" },
  website: { name: "官方网站", emoji: "网", color: "text-purple-700", bg: "bg-purple-50", gradient: "from-purple-500 to-purple-600" },
};

/* ── Mock Accounts ── */
const mockAccounts = [
  { id: 1, platform: "wechat_mp", accountName: "深象科技", accountId: "shenxiang_tech", followers: 12500, articles: 156, todayViews: 3420, status: "active", autoPublish: false, lastSyncAt: "2026-04-09 10:30", templates: 3, healthScore: 92 },
  { id: 2, platform: "xiaohongshu", accountName: "深象科技官方", accountId: "sx_tech_official", followers: 8200, articles: 89, todayViews: 1850, status: "active", autoPublish: false, lastSyncAt: "2026-04-09 09:15", templates: 2, healthScore: 88 },
  { id: 3, platform: "douyin", accountName: "深象科技", accountId: "shenxiang_dy", followers: 35000, articles: 42, todayViews: 8900, status: "active", autoPublish: false, lastSyncAt: "2026-04-08 18:00", templates: 1, healthScore: 75 },
  { id: 4, platform: "bilibili", accountName: "深象科技", accountId: "shenxiang_bili", followers: 5600, articles: 28, todayViews: 620, status: "inactive", autoPublish: false, lastSyncAt: "2026-04-07 12:00", templates: 0, healthScore: 45 },
  { id: 5, platform: "zhihu", accountName: "深象科技", accountId: "shenxiang_zhihu", followers: 9800, articles: 67, todayViews: 2100, status: "active", autoPublish: false, lastSyncAt: "2026-04-09 08:00", templates: 2, healthScore: 85 },
  { id: 6, platform: "toutiao", accountName: "深象科技", accountId: "shenxiang_tt", followers: 4200, articles: 95, todayViews: 1200, status: "active", autoPublish: false, lastSyncAt: "2026-04-09 07:00", templates: 1, healthScore: 80 },
  { id: 7, platform: "website", accountName: "shenxiang.tech", accountId: "official_site", followers: 0, articles: 45, todayViews: 560, status: "active", autoPublish: true, lastSyncAt: "2026-04-09 11:00", templates: 4, healthScore: 95 },
];

/* ── Mock Templates ── */
const mockTemplates = [
  { id: 1, name: "公众号深度文章模板", platform: "wechat_mp", category: "深度文章", usageCount: 42, createdAt: "2026-03-15" },
  { id: 2, name: "公众号快讯模板", platform: "wechat_mp", category: "快讯", usageCount: 28, createdAt: "2026-03-20" },
  { id: 3, name: "公众号周报模板", platform: "wechat_mp", category: "周报", usageCount: 14, createdAt: "2026-03-25" },
  { id: 4, name: "小红书图文笔记模板", platform: "xiaohongshu", category: "图文笔记", usageCount: 35, createdAt: "2026-03-18" },
  { id: 5, name: "小红书种草模板", platform: "xiaohongshu", category: "种草", usageCount: 22, createdAt: "2026-03-22" },
  { id: 6, name: "知乎专栏长文模板", platform: "zhihu", category: "专栏文章", usageCount: 18, createdAt: "2026-03-10" },
  { id: 7, name: "知乎回答模板", platform: "zhihu", category: "问答", usageCount: 30, createdAt: "2026-03-12" },
  { id: 8, name: "头条号资讯模板", platform: "toutiao", category: "资讯", usageCount: 15, createdAt: "2026-03-28" },
  { id: 9, name: "抖音文案脚本模板", platform: "douyin", category: "脚本", usageCount: 8, createdAt: "2026-04-01" },
  { id: 10, name: "官网博客文章模板", platform: "website", category: "博客", usageCount: 25, createdAt: "2026-03-05" },
  { id: 11, name: "官网产品更新日志模板", platform: "website", category: "更新日志", usageCount: 12, createdAt: "2026-03-08" },
  { id: 12, name: "官网白皮书模板", platform: "website", category: "白皮书", usageCount: 5, createdAt: "2026-03-30" },
  { id: 13, name: "官网案例研究模板", platform: "website", category: "案例", usageCount: 7, createdAt: "2026-04-02" },
];

/* ── Overview Stats ── */
function OverviewStats() {
  const totalFollowers = mockAccounts.reduce((s, a) => s + a.followers, 0);
  const totalViews = mockAccounts.reduce((s, a) => s + a.todayViews, 0);
  const activeCount = mockAccounts.filter(a => a.status === "active").length;
  const stats = [
    { label: "总粉丝数", value: totalFollowers.toLocaleString(), color: "text-primary" },
    { label: "今日浏览", value: totalViews.toLocaleString(), color: "text-blue-600" },
    { label: "活跃账号", value: `${activeCount}/${mockAccounts.length}`, color: "text-emerald-600" },
    { label: "内容模板", value: mockTemplates.length.toString(), color: "text-purple-600" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="card-elevated border-border/30">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">{s.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Account Card ── */
function AccountCard({ account, index }: { account: typeof mockAccounts[0]; index: number }) {
  const pc = platformConfig[account.platform] || { name: account.platform, emoji: "?", color: "text-gray-700", bg: "bg-gray-50", gradient: "from-gray-500 to-gray-600" };
  const isActive = account.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Card className="card-elevated border-border/30 group overflow-hidden">
        {/* Platform Color Bar */}
        <div className={`h-1 bg-gradient-to-r ${pc.gradient} ${!isActive ? "opacity-30" : ""}`} />
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className={`h-11 w-11 ring-2 ${isActive ? "ring-primary/15" : "ring-gray-200/50"}`}>
                <AvatarFallback className={`${pc.bg} ${pc.color} font-bold text-sm`}>
                  {pc.emoji}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground">{account.accountName}</p>
                  {account.autoPublish && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">自动</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{pc.name} · @{account.accountId}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-300"}`} />
              <span className="text-[11px] text-muted-foreground">{isActive ? "在线" : "离线"}</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-muted/20 rounded-xl px-3 py-2.5 text-center">
              <p className="text-sm font-bold text-foreground tracking-tight">{account.followers.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground/70">粉丝</p>
            </div>
            <div className="bg-muted/20 rounded-xl px-3 py-2.5 text-center">
              <p className="text-sm font-bold text-foreground tracking-tight">{account.articles}</p>
              <p className="text-[10px] text-muted-foreground/70">内容</p>
            </div>
            <div className="bg-muted/20 rounded-xl px-3 py-2.5 text-center">
              <p className="text-sm font-bold text-foreground tracking-tight">{account.todayViews.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground/70">今日浏览</p>
            </div>
          </div>

          {/* Health Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground">账号健康度</span>
              <span className={`text-xs font-semibold ${
                account.healthScore >= 80 ? "text-emerald-600" : account.healthScore >= 60 ? "text-amber-600" : "text-red-600"
              }`}>{account.healthScore}%</span>
            </div>
            <Progress
              value={account.healthScore}
              className="h-1.5"
            />
          </div>

          {/* Templates & Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <div className="flex items-center gap-1.5">
              <Layout className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">{account.templates} 个模板</span>
              <span className="text-muted-foreground/30 mx-1">|</span>
              <span className="text-[11px] text-muted-foreground">同步 {account.lastSyncAt.split(" ")[1]}</span>
            </div>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg btn-press" onClick={() => toast.info("同步功能即将上线")}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg btn-press" onClick={() => toast.info("功能即将上线")}>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg btn-press" onClick={() => toast.info("功能即将上线")}>
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Template Card ── */
function TemplateCard({ template, index }: { template: typeof mockTemplates[0]; index: number }) {
  const pc = platformConfig[template.platform] || { name: template.platform, emoji: "?", color: "text-gray-700", bg: "bg-gray-50", gradient: "from-gray-500 to-gray-600" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
    >
      <Card className="card-elevated border-border/30 group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl ${pc.bg} flex items-center justify-center`}>
                <FileText className={`h-4 w-4 ${pc.color}`} />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{template.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="secondary" className={`${pc.bg} ${pc.color} border-0 text-[10px]`}>{pc.name}</Badge>
                  <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px]">{template.category}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-border/20">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground">使用 {template.usageCount} 次</span>
              <span className="text-[11px] text-muted-foreground">创建于 {template.createdAt}</span>
            </div>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-lg btn-press" onClick={() => toast.info("预览功能即将上线")}>
                <Eye className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-lg btn-press" onClick={() => toast.info("复制功能即将上线")}>
                <Copy className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-lg btn-press text-red-500 hover:text-red-600" onClick={() => toast.info("删除功能即将上线")}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function Accounts() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const filteredTemplates = selectedPlatform === "all"
    ? mockTemplates
    : mockTemplates.filter(t => t.platform === selectedPlatform);

  const usedPlatforms = Array.from(new Set(mockTemplates.map(t => t.platform)));

  return (
    <PageShell
      title="账号托管"
      description="多平台自媒体账号统一管理与内容模板"
      icon={<Share2 className="h-5 w-5" />}
      action={{ label: "添加账号", onClick: () => toast.info("添加账号功能即将上线") }}
    >
      <Tabs defaultValue="accounts" className="space-y-5">
        <TabsList className="bg-muted/30 p-1 h-auto rounded-xl">
          <TabsTrigger value="accounts" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:shadow-black/[0.04] px-5 py-2 rounded-lg font-medium">
            账号管理
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:shadow-black/[0.04] px-5 py-2 rounded-lg font-medium">
            内容模板
          </TabsTrigger>
        </TabsList>

        {/* ── Accounts Tab ── */}
        <TabsContent value="accounts" className="space-y-5">
          <OverviewStats />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {mockAccounts.map((account, i) => (
              <AccountCard key={account.id} account={account} index={i} />
            ))}
            {/* Add Account Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mockAccounts.length * 0.04, duration: 0.3 }}
            >
              <Card
                className="border-dashed border-2 border-border/40 shadow-none hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-300 cursor-pointer h-full min-h-[280px] flex items-center justify-center rounded-2xl"
                onClick={() => toast.info("添加账号功能即将上线")}
              >
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">添加新账号</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">支持 20+ 主流平台</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* ── Templates Tab ── */}
        <TabsContent value="templates" className="space-y-5">
          {/* Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={selectedPlatform === "all" ? "default" : "outline"}
                size="sm"
                className={`h-8 text-xs rounded-lg btn-press ${selectedPlatform === "all" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "border-border/50"}`}
                onClick={() => setSelectedPlatform("all")}
              >
                全部平台
              </Button>
              {usedPlatforms.map(p => {
                const pc = platformConfig[p];
                return (
                  <Button
                    key={p}
                    variant={selectedPlatform === p ? "default" : "outline"}
                    size="sm"
                    className={`h-8 text-xs rounded-lg btn-press ${selectedPlatform === p ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "border-border/50"}`}
                    onClick={() => setSelectedPlatform(p)}
                  >
                    {pc?.name || p}
                  </Button>
                );
              })}
            </div>
            <Button
              size="sm"
              className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg btn-press shadow-sm shadow-primary/20"
              onClick={() => toast.info("上传模板功能即将上线")}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              上传模板
            </Button>
          </div>

          {/* Templates Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPlatform}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
            >
              {filteredTemplates.map((template, i) => (
                <TemplateCard key={template.id} template={template} index={i} />
              ))}
              {/* Upload Template Card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: filteredTemplates.length * 0.03 }}
              >
                <Card
                  className="border-dashed border-2 border-border/40 shadow-none hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-300 cursor-pointer min-h-[120px] flex items-center justify-center rounded-2xl"
                  onClick={() => toast.info("上传模板功能即将上线")}
                >
                  <CardContent className="p-4 text-center">
                    <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs font-medium text-muted-foreground">上传自定义模板</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
