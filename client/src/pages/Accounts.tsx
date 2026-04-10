import { useState } from "react";
import PageShell from "@/components/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/DataTable";
import ContentEditor, { type EditorContent } from "@/components/ContentEditor";
import PlatformPreviewPanel, { type PreviewContent } from "@/components/PlatformPreview";
import {
  Share2, Plus, Eye, Copy, Trash2, Upload, Settings, ArrowLeft,
  FileText, Image, Music, Video, BarChart3, Users, TrendingUp,
  CheckCircle2, Clock, Pencil
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

/* ── Platform Config ── */
const platformConfig: Record<string, { name: string; color: string; bg: string; icon: string; type: string }> = {
  wechat_mp: { name: "微信公众号", color: "text-green-700", bg: "bg-green-50", icon: "💬", type: "图文" },
  xiaohongshu: { name: "小红书", color: "text-red-600", bg: "bg-red-50", icon: "📕", type: "图文" },
  douyin: { name: "抖音", color: "text-gray-800", bg: "bg-gray-100", icon: "🎵", type: "视频" },
  bilibili: { name: "B站", color: "text-blue-600", bg: "bg-blue-50", icon: "📺", type: "视频" },
  zhihu: { name: "知乎", color: "text-blue-700", bg: "bg-blue-50", icon: "📘", type: "图文" },
  weibo: { name: "微博", color: "text-orange-600", bg: "bg-orange-50", icon: "📢", type: "图文" },
  toutiao: { name: "今日头条", color: "text-red-700", bg: "bg-red-50", icon: "📰", type: "图文" },
  website: { name: "官方网站", color: "text-orange-600", bg: "bg-orange-50", icon: "🌐", type: "图文" },
  ximalaya: { name: "喜马拉雅", color: "text-orange-700", bg: "bg-orange-50", icon: "🎧", type: "音频" },
  podcast: { name: "播客", color: "text-purple-700", bg: "bg-purple-50", icon: "🎙️", type: "音频" },
  youtube: { name: "YouTube", color: "text-red-600", bg: "bg-red-50", icon: "▶️", type: "视频" },
  twitter: { name: "X/Twitter", color: "text-gray-800", bg: "bg-gray-100", icon: "🐦", type: "图文" },
};

/* ── Mock Data ── */
interface Account {
  id: string;
  name: string;
  platform: string;
  followers: number;
  status: "active" | "inactive" | "pending";
  lastPublished: string;
  avatar?: string;
}

interface AccountContent {
  id: number;
  title: string;
  status: "draft" | "published" | "scheduled" | "failed";
  type: "article" | "image" | "video" | "audio";
  createdAt: string;
  publishedAt?: string;
}

interface Template {
  id: number;
  name: string;
  platform: string;
  category: string;
  usageCount: number;
  createdAt: string;
}

const mockAccounts: Account[] = [
  { id: "acc1", name: "深象科技", platform: "wechat_mp", followers: 12800, status: "active", lastPublished: "2026-04-09" },
  { id: "acc2", name: "深象OPCS", platform: "xiaohongshu", followers: 8500, status: "active", lastPublished: "2026-04-08" },
  { id: "acc3", name: "深象科技", platform: "douyin", followers: 25600, status: "active", lastPublished: "2026-04-07" },
  { id: "acc4", name: "深象科技", platform: "bilibili", followers: 6200, status: "inactive", lastPublished: "2026-03-20" },
  { id: "acc5", name: "深象科技", platform: "zhihu", followers: 4300, status: "active", lastPublished: "2026-04-06" },
  { id: "acc6", name: "opcs.vip", platform: "website", followers: 0, status: "active", lastPublished: "2026-04-09" },
  { id: "acc7", name: "深象播客", platform: "ximalaya", followers: 3200, status: "active", lastPublished: "2026-04-05" },
  { id: "acc8", name: "OPC创业话", platform: "podcast", followers: 1800, status: "pending", lastPublished: "" },
  { id: "acc9", name: "ShenXiang Tech", platform: "youtube", followers: 950, status: "pending", lastPublished: "" },
  { id: "acc10", name: "ShenXiang_OPC", platform: "twitter", followers: 620, status: "active", lastPublished: "2026-04-08" },
];

const mockAccountContents: AccountContent[] = [
  { id: 1, title: "2026年一人公司趋势报告", status: "published", type: "article", createdAt: "2026-04-09", publishedAt: "2026-04-09 10:00" },
  { id: 2, title: "AI 辅助内容生产实践指南", status: "scheduled", type: "article", createdAt: "2026-04-08" },
  { id: 3, title: "小红书爆款标题公式解析", status: "draft", type: "image", createdAt: "2026-04-07" },
  { id: 4, title: "深象科技周报 Vol.14", status: "published", type: "article", createdAt: "2026-04-06", publishedAt: "2026-04-06 18:00" },
  { id: 5, title: "创业者工具箱推荐视频", status: "failed", type: "video", createdAt: "2026-04-05" },
];

const mockTemplates: Template[] = [
  { id: 1, name: "公众号长文模板", platform: "wechat_mp", category: "文章", usageCount: 28, createdAt: "2026-03-15" },
  { id: 2, name: "小红书图文模板", platform: "xiaohongshu", category: "图文", usageCount: 45, createdAt: "2026-03-10" },
  { id: 3, name: "抖音文案模板", platform: "douyin", category: "短视频", usageCount: 12, createdAt: "2026-03-20" },
  { id: 4, name: "知乎回答模板", platform: "zhihu", category: "问答", usageCount: 8, createdAt: "2026-03-25" },
  { id: 5, name: "通用周报模板", platform: "wechat_mp", category: "周报", usageCount: 14, createdAt: "2026-03-01" },
];

const contentStatusMap: Record<string, { label: string; variant: string }> = {
  draft: { label: "草稿", variant: "bg-gray-100 text-gray-600" },
  published: { label: "已发布", variant: "bg-emerald-100 text-emerald-700" },
  scheduled: { label: "已排期", variant: "bg-blue-100 text-blue-700" },
  failed: { label: "失败", variant: "bg-red-100 text-red-700" },
};

const contentTypeIcons: Record<string, React.ReactNode> = {
  article: <FileText className="h-3.5 w-3.5" />,
  image: <Image className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  audio: <Music className="h-3.5 w-3.5" />,
};

/* ── Overview Stats ── */
function OverviewStats() {
  const stats = [
    { label: "总账号", value: mockAccounts.length, icon: <Share2 className="h-4 w-4" />, color: "text-primary" },
    { label: "活跃账号", value: mockAccounts.filter(a => a.status === "active").length, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-600" },
    { label: "总粉丝", value: "5.7万", icon: <Users className="h-4 w-4" />, color: "text-blue-600" },
    { label: "本月发布", value: 24, icon: <TrendingUp className="h-4 w-4" />, color: "text-orange-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <Card className="card-elevated border-border/30 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`${s.color}`}>{s.icon}</span>
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

/* ── Account Card ── */
function AccountCard({ account, index, onClick }: { account: Account; index: number; onClick: () => void }) {
  const pc = platformConfig[account.platform] || { name: account.platform, color: "text-gray-600", bg: "bg-gray-50", icon: "📱" };
  const statusColors = {
    active: "bg-emerald-500",
    inactive: "bg-gray-400",
    pending: "bg-amber-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Card
        className="card-elevated border-border/30 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={onClick}
      >
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl ${pc.bg} flex items-center justify-center text-2xl shadow-sm`}>
                {pc.icon}
              </div>
              <div>
                <h3 className="font-semibold text-[14px] text-foreground">{account.name}</h3>
                <Badge variant="secondary" className={`${pc.bg} ${pc.color} border-0 text-[10px] mt-0.5`}>
                  {pc.name}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${statusColors[account.status]}`} />
              <span className="text-[10px] text-muted-foreground">
                {account.status === "active" ? "活跃" : account.status === "inactive" ? "未激活" : "待验证"}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-muted/20 rounded-xl px-3 py-2">
              <p className="text-[10px] text-muted-foreground">粉丝数</p>
              <p className="text-sm font-semibold">{account.followers >= 10000 ? `${(account.followers / 10000).toFixed(1)}万` : account.followers.toLocaleString()}</p>
            </div>
            <div className="bg-muted/20 rounded-xl px-3 py-2">
              <p className="text-[10px] text-muted-foreground">最近发布</p>
              <p className="text-sm font-semibold">{account.lastPublished}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border/20">
            <span className="text-[11px] text-muted-foreground">点击管理内容</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg btn-press" onClick={(e) => { e.stopPropagation(); toast.info("设置功能即将上线"); }}>
                <Settings className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg btn-press" onClick={(e) => { e.stopPropagation(); toast.info("数据分析即将上线"); }}>
                <BarChart3 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Account Detail View ── */
function AccountDetail({ account, onBack }: { account: Account; onBack: () => void }) {
  const pc = platformConfig[account.platform] || { name: account.platform, color: "text-gray-600", bg: "bg-gray-50", icon: "📱" };
  const [activeTab, setActiveTab] = useState("contents");
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editorContent, setEditorContent] = useState<EditorContent>({ title: "", body: "", summary: "", tags: [] });
  const [previewContent, setPreviewContent] = useState<PreviewContent | null>(null);

  const handlePreview = (content?: AccountContent) => {
    const pc: PreviewContent = content ? {
      title: content.title,
      body: "这是文章的正文内容。在实际使用中，这里会显示从数据库加载的完整文章内容。\n\n一人公司（One Person Company）是一种新兴的创业形态，创业者独立运营公司的所有业务环节。\n\n通过 AI 工具和自动化流程，一人公司可以实现传统团队才能完成的工作量。",
      author: account.name,
      publishDate: content.publishedAt || content.createdAt,
      tags: ["一人公司", "创业", "AI"],
      platform: account.platform,
    } : {
      title: editorContent.title || "未命名内容",
      body: editorContent.body || "暂无内容",
      summary: editorContent.summary,
      author: account.name,
      tags: editorContent.tags,
      platform: account.platform,
    };
    setPreviewContent(pc);
    setShowPreview(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl btn-press" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className={`w-10 h-10 rounded-xl ${pc.bg} flex items-center justify-center text-xl`}>
            {pc.icon}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{account.name}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`${pc.bg} ${pc.color} border-0 text-[10px]`}>{pc.name}</Badge>
              <span className="text-xs text-muted-foreground">粉丝 {account.followers >= 10000 ? `${(account.followers / 10000).toFixed(1)}万` : account.followers.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-xl border-border/50 btn-press"
            onClick={() => { setShowEditor(false); setShowPreview(false); }}
          >
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> 数据
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground btn-press shadow-sm shadow-primary/20"
            onClick={() => { setShowEditor(true); setShowPreview(false); }}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> 新建内容
          </Button>
        </div>
      </div>

      {/* Editor + Preview */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="card-elevated border-border/30 rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">编辑内容</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs rounded-lg border-border/50"
                      onClick={() => handlePreview()}
                    >
                      <Eye className="h-3 w-3 mr-1" /> 预览效果
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => { toast.success("内容已保存为草稿"); setShowEditor(false); }}
                    >
                      保存草稿
                    </Button>
                  </div>
                </div>
                <ContentEditor
                  platform={account.platform}
                  onChange={setEditorContent}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Panel */}
      <AnimatePresence>
        {showPreview && previewContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="card-elevated border-border/30 rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <PlatformPreviewPanel
                  content={previewContent}
                  defaultPlatform={account.platform}
                  onClose={() => setShowPreview(false)}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs: Contents / Templates / Assets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30 p-1 h-auto rounded-xl">
          <TabsTrigger value="contents" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-5 py-2 rounded-lg font-medium">
            内容列表
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-5 py-2 rounded-lg font-medium">
            模板管理
          </TabsTrigger>
          <TabsTrigger value="assets" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-5 py-2 rounded-lg font-medium">
            素材库
          </TabsTrigger>
        </TabsList>

        {/* Contents Tab */}
        <TabsContent value="contents" className="space-y-3 mt-4">
          {mockAccountContents.map((content, i) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="card-elevated border-border/30 rounded-xl hover:shadow-md transition-all duration-200 group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    content.type === "article" ? "bg-blue-50 text-blue-500" :
                    content.type === "image" ? "bg-purple-50 text-purple-500" :
                    content.type === "video" ? "bg-rose-50 text-rose-500" :
                    "bg-amber-50 text-amber-500"
                  }`}>
                    {contentTypeIcons[content.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">{content.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={content.status} map={contentStatusMap} />
                      <span className="text-[11px] text-muted-foreground">{content.createdAt}</span>
                      {content.publishedAt && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-3 w-3" /> {content.publishedAt}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg btn-press" onClick={() => handlePreview(content)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg btn-press" onClick={() => { setShowEditor(true); toast.info("编辑模式"); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg btn-press" onClick={() => toast.info("复制功能即将上线")}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{mockTemplates.filter(t => t.platform === account.platform || account.platform === "website").length} 个模板</span>
            <Button size="sm" className="h-8 text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground btn-press shadow-sm shadow-primary/20">
              <Upload className="h-3.5 w-3.5 mr-1.5" /> 上传模板
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {mockTemplates.map((template, i) => {
              const tpc = platformConfig[template.platform] || { name: template.platform, color: "text-gray-600", bg: "bg-gray-50", icon: "📱" };
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="card-elevated border-border/30 rounded-xl hover:shadow-md transition-all duration-200 group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-lg ${tpc.bg} flex items-center justify-center text-lg`}>
                          {tpc.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{template.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant="secondary" className={`${tpc.bg} ${tpc.color} border-0 text-[10px]`}>{tpc.name}</Badge>
                            <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px]">{template.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2.5 border-t border-border/20">
                        <span className="text-[11px] text-muted-foreground">使用 {template.usageCount} 次</span>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-lg btn-press" onClick={() => toast.info("预览模板")}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-lg btn-press" onClick={() => toast.info("复制模板")}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">素材管理</span>
            <Button size="sm" className="h-8 text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground btn-press shadow-sm shadow-primary/20">
              <Upload className="h-3.5 w-3.5 mr-1.5" /> 上传素材
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { type: "image" as const, label: "图片素材", count: 48, icon: <Image className="h-6 w-6" />, color: "text-blue-500 bg-blue-50" },
              { type: "audio" as const, label: "音频素材", count: 12, icon: <Music className="h-6 w-6" />, color: "text-purple-500 bg-purple-50" },
              { type: "video" as const, label: "视频素材", count: 8, icon: <Video className="h-6 w-6" />, color: "text-rose-500 bg-rose-50" },
              { type: "file" as const, label: "文档素材", count: 24, icon: <FileText className="h-6 w-6" />, color: "text-amber-500 bg-amber-50" },
            ].map((asset, i) => (
              <motion.div
                key={asset.type}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="card-elevated border-border/30 rounded-2xl hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => toast.info(`${asset.label}管理即将上线`)}
                >
                  <CardContent className="p-5 text-center">
                    <div className={`w-14 h-14 rounded-2xl ${asset.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform`}>
                      {asset.icon}
                    </div>
                    <p className="text-sm font-medium">{asset.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{asset.count} 个文件</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

/* ── Template Card (for overview) ── */
function TemplateCard({ template, index }: { template: Template; index: number }) {
  const pc = platformConfig[template.platform] || { name: template.platform, color: "text-gray-600", bg: "bg-gray-50", icon: "📱" };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
    >
      <Card className="card-elevated border-border/30 rounded-2xl hover:shadow-md transition-all duration-200 group">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-lg ${pc.bg} flex items-center justify-center text-lg`}>
              {pc.icon}
            </div>
            <div>
              <p className="font-medium text-sm">{template.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="secondary" className={`${pc.bg} ${pc.color} border-0 text-[10px]`}>{pc.name}</Badge>
                <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px]">{template.category}</Badge>
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
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const filteredTemplates = selectedPlatform === "all"
    ? mockTemplates
    : mockTemplates.filter(t => t.platform === selectedPlatform);

  const usedPlatforms = Array.from(new Set(mockTemplates.map(t => t.platform)));

  if (selectedAccount) {
    return (
      <PageShell
        title="账号托管"
        description="多平台自媒体账号统一管理与内容模板"
        icon={<Share2 className="h-5 w-5" />}
      >
        <AccountDetail account={selectedAccount} onBack={() => setSelectedAccount(null)} />
      </PageShell>
    );
  }

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

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-5">
          <OverviewStats />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {mockAccounts.map((account, i) => (
              <AccountCard key={account.id} account={account} index={i} onClick={() => setSelectedAccount(account)} />
            ))}
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

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-5">
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
                const ppc = platformConfig[p];
                return (
                  <Button
                    key={p}
                    variant={selectedPlatform === p ? "default" : "outline"}
                    size="sm"
                    className={`h-8 text-xs rounded-lg btn-press ${selectedPlatform === p ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "border-border/50"}`}
                    onClick={() => setSelectedPlatform(p)}
                  >
                    {ppc?.name || p}
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
