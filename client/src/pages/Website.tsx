import { useState } from "react";
import PageShell from "@/components/PageShell";
import DataTable, { StatusBadge } from "@/components/DataTable";
import {
  Globe, Bot, Sparkles, Pencil, Image, LayoutTemplate, Search, Share2,
  Settings2, Clock, CheckCircle2, AlertCircle, Play, Pause, ChevronDown, ChevronUp,
  FileText, TrendingUp, Zap, History, Eye, ArrowLeft, ExternalLink
} from "lucide-react";
import ContentEditor, { type EditorContent } from "@/components/ContentEditor";
import PlatformPreviewPanel from "@/components/PlatformPreview";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_ARTICLES as SITE_ARTICLES } from "@shared/siteConfig";

/* ── Status Maps ── */
const statusMap: Record<string, { label: string; variant: string }> = {
  draft: { label: "草稿", variant: "bg-gray-100 text-gray-600" },
  published: { label: "已发布", variant: "bg-emerald-100 text-emerald-700" },
  archived: { label: "已归档", variant: "bg-amber-100 text-amber-700" },
  ai_generated: { label: "AI生成", variant: "bg-violet-100 text-violet-700" },
  ai_pending: { label: "AI待审", variant: "bg-blue-100 text-blue-700" },
};

const sourceMap: Record<string, { label: string; variant: string }> = {
  manual: { label: "手动", variant: "bg-gray-100 text-gray-600" },
  ai_original: { label: "AI原创", variant: "bg-violet-100 text-violet-700" },
  ai_rewrite: { label: "AI改写", variant: "bg-blue-100 text-blue-700" },
  ai_curated: { label: "AI转载", variant: "bg-amber-100 text-amber-700" },
};

/* ── Mock Data（ID 与 siteConfig.ts 前台文章 ID 对齐） ── */
const mockArticles = [
  { id: 601, title: "2026年一人公司趋势报告", slug: "/blog/opc-trends-2026", category: "趋势报告", status: "published", source: "manual", publishedAt: "2026-04-09", siteArticleId: 601 },
  { id: 303, title: "AI 辅助内容生产实践指南", slug: "/blog/ai-content-guide", category: "实操指南", status: "published", source: "manual", publishedAt: "2026-04-07", siteArticleId: 303 },
  { id: 101, title: "通义千问 3.0 发布：一人公司如何用好新能力", slug: "/blog/qwen3-for-opc", category: "AI动态", status: "ai_generated", source: "ai_original", publishedAt: "2026-04-09", siteArticleId: 101 },
  { id: 202, title: "[转载] Y Combinator 2026春季批次趋势分析", slug: "/blog/yc-2026-spring", category: "行业洞察", status: "ai_pending", source: "ai_curated", publishedAt: "-", siteArticleId: 202 },
  { id: 403, title: "数据安全合规白皮书", slug: "/blog/data-security", category: "白皮书", status: "draft", source: "manual", publishedAt: "-", siteArticleId: 403 },
  { id: 602, title: "深象科技产品更新日志", slug: "/blog/changelog", category: "产品动态", status: "published", source: "manual", publishedAt: "2026-04-05", siteArticleId: 602 },
  { id: 701, title: "Solopreneur 工具链 2026 年度盘点", slug: "/blog/tools-2026", category: "资源推荐", status: "ai_generated", source: "ai_rewrite", publishedAt: "2026-04-08", siteArticleId: 701 },
  { id: 703, title: "创业者工具箱推荐", slug: "/blog/tools", category: "资源推荐", status: "archived", source: "manual", publishedAt: "2026-03-28", siteArticleId: 703 },
];

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: string;
  source: string;
  publishedAt: string;
  body?: string;
  tags?: string[];
  siteArticleId?: number;
}

const mockArticlesTyped: ArticleItem[] = mockArticles.map(a => {
  // 尝试从前台 siteConfig 获取完整文章内容
  const siteArticle = SITE_ARTICLES.find(sa => sa.id === a.siteArticleId);
  return {
    ...a,
    body: siteArticle
      ? `${siteArticle.summary}\n\n${siteArticle.content || "深象科技致力于为一人公司创业者提供专业的内容运营服务。"}`
      : "这是一篇关于" + a.title + "的详细内容。\n\n深象科技致力于为一人公司创业者提供专业的内容运营服务。",
    tags: siteArticle ? siteArticle.tags : [a.category],
  };
});

/* ── AI Autopilot Pipeline Steps ── */
interface PipelineStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
  frequency?: string;
  lastRun?: string;
  status: "idle" | "running" | "success" | "error";
}

const defaultPipeline: PipelineStep[] = [
  { id: "topic", name: "自动选题", icon: <TrendingUp className="h-4 w-4" />, description: "基于行业趋势、热点和关键词自动生成每日选题", enabled: true, frequency: "每日 06:00", lastRun: "2026-04-09 06:00", status: "success" },
  { id: "research", name: "自动检索", icon: <Search className="h-4 w-4" />, description: "自动检索相关资料、论文、新闻作为写作素材", enabled: true, frequency: "选题后自动触发", lastRun: "2026-04-09 06:15", status: "success" },
  { id: "write", name: "自动写作", icon: <Pencil className="h-4 w-4" />, description: "AI 根据选题和素材自动撰写文章（通义千问）", enabled: true, frequency: "检索后自动触发", lastRun: "2026-04-09 06:45", status: "success" },
  { id: "image", name: "自动生图", icon: <Image className="h-4 w-4" />, description: "AI 自动生成文章配图、封面图和插图", enabled: true, frequency: "写作后自动触发", lastRun: "2026-04-09 07:00", status: "success" },
  { id: "layout", name: "自动排版", icon: <LayoutTemplate className="h-4 w-4" />, description: "自动完成文章排版、格式化和 SEO 优化", enabled: true, frequency: "生图后自动触发", lastRun: "2026-04-09 07:10", status: "success" },
  { id: "curate", name: "自动转发", icon: <Share2 className="h-4 w-4" />, description: "自动抓取和改写其他网站的优质内容，注明来源", enabled: true, frequency: "每日 12:00", lastRun: "2026-04-09 12:00", status: "idle" },
];

/* ── AI Autopilot Log ── */
const mockLogs = [
  { time: "09:12", type: "success" as const, message: "自动选题完成：生成 3 个选题建议" },
  { time: "09:15", type: "success" as const, message: "自动检索完成：收集 12 篇相关素材" },
  { time: "09:45", type: "success" as const, message: "自动写作完成：《通义千问 3.0 发布：一人公司如何用好新能力》" },
  { time: "10:00", type: "success" as const, message: "自动生图完成：生成 3 张配图" },
  { time: "10:10", type: "success" as const, message: "自动排版完成，文章已进入待审队列" },
  { time: "12:00", type: "info" as const, message: "自动转发：发现 2 篇优质内容待改写" },
  { time: "12:30", type: "success" as const, message: "转载改写完成：《Y Combinator 2026春季批次趋势分析》" },
];

/* ── AI Autopilot Panel Component ── */
function AIAutopilotPanel() {
  const [enabled, setEnabled] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [pipeline, setPipeline] = useState(defaultPipeline);
  const [activeTab, setActiveTab] = useState<"pipeline" | "config" | "logs">("pipeline");

  const toggleStep = (stepId: string) => {
    setPipeline(prev => prev.map(s => s.id === stepId ? { ...s, enabled: !s.enabled } : s));
  };

  const handleToggleAutopilot = (checked: boolean) => {
    setEnabled(checked);
    if (checked) {
      toast.success("AI 托管模式已开启", { description: "AI 将按照配置自动运行内容生产流水线" });
    } else {
      toast.info("AI 托管模式已关闭", { description: "所有自动任务已暂停" });
    }
  };

  const runningSteps = pipeline.filter(s => s.status === "running").length;
  const enabledSteps = pipeline.filter(s => s.enabled).length;

  return (
    <div className="mb-6 border border-violet-200/80 rounded-xl bg-gradient-to-r from-violet-50/50 to-orange-50/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${enabled ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-500"} transition-colors`}>
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground text-sm">AI 全自动托管</h3>
              {enabled && (
                <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  运行中
                </span>
              )}
              {!enabled && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">已暂停</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI 自动完成选题、写作、生图、排版、检索和转发 · 已启用 {enabledSteps}/{pipeline.length} 个步骤
              {runningSteps > 0 && <span className="text-amber-600"> · {runningSteps} 个任务运行中</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={enabled} onCheckedChange={handleToggleAutopilot} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground"
          >
            <Settings2 className="h-4 w-4 mr-1" />
            配置
            {expanded ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
          </Button>
        </div>
      </div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-violet-200/60 px-5 pb-5 pt-4">
              {/* Tabs */}
              <div className="flex gap-1 mb-4 bg-white/60 rounded-lg p-1 w-fit">
                {([
                  { id: "pipeline" as const, label: "流水线", icon: <Zap className="h-3.5 w-3.5" /> },
                  { id: "config" as const, label: "偏好设置", icon: <Settings2 className="h-3.5 w-3.5" /> },
                  { id: "logs" as const, label: "运行日志", icon: <History className="h-3.5 w-3.5" /> },
                ]).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-white text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Pipeline Tab */}
              {activeTab === "pipeline" && (
                <div className="space-y-2">
                  {/* Visual pipeline flow */}
                  <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
                    {pipeline.map((step, i) => (
                      <div key={step.id} className="flex items-center">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                          !step.enabled ? "bg-gray-100 text-gray-400 opacity-50" :
                          step.status === "running" ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300" :
                          step.status === "success" ? "bg-emerald-50 text-emerald-700" :
                          step.status === "error" ? "bg-red-50 text-red-700" :
                          "bg-white text-foreground border border-border/30"
                        }`}>
                          {step.icon}
                          {step.name}
                          {step.status === "success" && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                          {step.status === "running" && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                          {step.status === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
                        </div>
                        {i < pipeline.length - 1 && (
                          <div className={`w-6 h-px mx-0.5 ${step.enabled ? "bg-violet-300" : "bg-gray-200"}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Step cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {pipeline.map(step => (
                      <div
                        key={step.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                          step.enabled ? "border-violet-200/60 bg-white" : "border-border/30 bg-muted/20 opacity-60"
                        }`}
                      >
                        <div className={`p-1.5 rounded-md mt-0.5 ${step.enabled ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-400"}`}>
                          {step.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{step.name}</span>
                            <Switch checked={step.enabled} onCheckedChange={() => toggleStep(step.id)} className="scale-75" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{step.description}</p>
                          {step.enabled && (
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{step.frequency}</span>
                              {step.lastRun && <span>上次: {step.lastRun}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-3 gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.info("正在手动触发完整流水线...")} className="text-xs gap-1.5">
                      <Play className="h-3.5 w-3.5" /> 手动运行一次
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast.info("所有任务已暂停")} className="text-xs gap-1.5">
                      <Pause className="h-3.5 w-3.5" /> 暂停所有
                    </Button>
                  </div>
                </div>
              )}

              {/* Config Tab */}
              {activeTab === "config" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-violet-500" /> 内容偏好</h4>
                      <div className="space-y-2">
                        {[
                          { label: "主题领域", value: "一人公司、AI创业、独立开发" },
                          { label: "写作风格", value: "专业但易读，偏实操" },
                          { label: "文章长度", value: "1500-3000 字" },
                          { label: "配图风格", value: "简约科技风、品牌橙色系" },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between py-1.5 px-3 bg-white rounded-xl border border-border/40">
                            <span className="text-xs text-muted-foreground">{item.label}</span>
                            <span className="text-xs font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-1.5"><Settings2 className="h-4 w-4 text-violet-500" /> 运行配置</h4>
                      <div className="space-y-2">
                        {[
                          { label: "每日原创数量", value: "1-2 篇" },
                          { label: "每日转载数量", value: "1-3 篇" },
                          { label: "自动发布", value: "需人工审核后发布" },
                          { label: "AI 模型", value: "通义千问 Max" },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between py-1.5 px-3 bg-white rounded-xl border border-border/40">
                            <span className="text-xs text-muted-foreground">{item.label}</span>
                            <span className="text-xs font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-1.5"><Globe className="h-4 w-4 text-violet-500" /> 转发来源</h4>
                    <div className="flex flex-wrap gap-2">
                      {["36氪", "虎嗅", "少数派", "Hacker News", "TechCrunch", "Product Hunt", "GitHub Trending"].map(src => (
                        <span key={src} className="px-2.5 py-1 bg-white rounded-full border border-border/40 text-xs">{src}</span>
                      ))}
                      <button className="px-2.5 py-1 bg-violet-50 rounded-full border border-violet-200 text-xs text-violet-600 hover:bg-violet-100 transition-colors">
                        + 添加来源
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs" onClick={() => toast.success("配置已保存")}>
                      保存配置
                    </Button>
                  </div>
                </div>
              )}

              {/* Logs Tab */}
              {activeTab === "logs" && (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">今日运行日志 · 2026-04-09</span>
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => toast.info("查看完整日志")}>
                      查看全部
                    </Button>
                  </div>
                  {mockLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-1.5 px-3 rounded-xl bg-white/80 border border-border/30">
                      <span className="text-xs text-muted-foreground font-mono whitespace-nowrap mt-0.5">{log.time}</span>
                      {log.type === "success" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                      )}
                      <span className="text-xs text-foreground">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Article Detail View ── */
function ArticleDetail({ item, onBack }: { item: ArticleItem; onBack: () => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const [editorContent, setEditorContent] = useState<EditorContent>({
    title: item.title,
    body: item.body || "",
    summary: "",
    tags: item.tags || [],
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl btn-press" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-semibold text-lg">{item.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={item.status} map={statusMap} />
              <StatusBadge status={item.source} map={sourceMap} />
              <span className="text-xs text-muted-foreground">{item.category}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-xl border-border/50 btn-press"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" /> {showPreview ? "关闭预览" : "多平台预览"}
          </Button>
          <a
            href={`/site/article/${item.siteArticleId || item.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-xl border border-border/50 hover:bg-muted/30 transition-colors btn-press"
          >
            <ExternalLink className="h-3.5 w-3.5" /> 前台预览
          </a>
          <Button
            size="sm"
            className="h-8 text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground btn-press shadow-sm shadow-primary/20"
            onClick={() => toast.success("文章已保存")}
          >
            保存
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="card-elevated border-border/30 rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <PlatformPreviewPanel
                  content={{
                    title: editorContent.title,
                    body: editorContent.body,
                    author: "深象科技",
                    publishDate: item.publishedAt,
                    tags: editorContent.tags,
                    platform: "website",
                  }}
                  onClose={() => setShowPreview(false)}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="card-elevated border-border/30 rounded-2xl">
        <CardContent className="p-6">
          <ContentEditor initialContent={editorContent} onChange={setEditorContent} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function Website() {
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  const columns = [
    { key: "title", label: "标题", render: (row: ArticleItem) => (
      <button
        className="text-left"
        onClick={() => setSelectedArticle(row)}
      >
        <span className="font-medium text-foreground hover:text-primary transition-colors">{row.title}</span>
        <span className="block text-xs text-muted-foreground font-mono mt-0.5">{row.slug}</span>
      </button>
    )},
    { key: "category", label: "分类" },
    { key: "source", label: "来源", render: (row: ArticleItem) => <StatusBadge status={row.source} map={sourceMap} /> },
    { key: "status", label: "状态", render: (row: ArticleItem) => <StatusBadge status={row.status} map={statusMap} /> },
    { key: "publishedAt", label: "发布时间" },
    { key: "actions", label: "操作", render: (row: ArticleItem) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg btn-press" onClick={() => setSelectedArticle(row)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <a href={`/site/article/${row.siteArticleId || row.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-7 w-7 rounded-lg hover:bg-muted/30 transition-colors">
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </a>
      </div>
    )},
  ];

  if (selectedArticle) {
    return (
      <PageShell title="网站文章" description="管理官方网站内容发布，支持 AI 全自动托管" icon={<Globe className="h-5 w-5" />}>
        <ArticleDetail item={selectedArticle} onBack={() => setSelectedArticle(null)} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="网站文章"
      description="管理官方网站内容发布，支持 AI 全自动托管"
      icon={<Globe className="h-5 w-5" />}
      action={{ label: "新建文章", onClick: () => toast.info("新建文章功能即将上线") }}
    >
      <AIAutopilotPanel />
      <DataTable columns={columns} data={mockArticlesTyped} searchPlaceholder="搜索文章..." />
    </PageShell>
  );
}
