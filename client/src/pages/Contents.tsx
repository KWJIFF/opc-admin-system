import { useState } from "react";
import PageShell from "@/components/PageShell";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ContentEditor, { type EditorContent } from "@/components/ContentEditor";
import PlatformPreviewPanel from "@/components/PlatformPreview";
import {
  FileText, Eye, Pencil, Copy, ArrowLeft, Send
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const statusMap: Record<string, { label: string; variant: string }> = {
  draft: { label: "草稿", variant: "bg-gray-100 text-gray-600" },
  writing: { label: "撰写中", variant: "bg-blue-100 text-blue-700" },
  review_pending: { label: "待审核", variant: "bg-amber-100 text-amber-700" },
  review_passed: { label: "审核通过", variant: "bg-emerald-100 text-emerald-700" },
  review_rejected: { label: "审核驳回", variant: "bg-red-100 text-red-700" },
  ready: { label: "待发布", variant: "bg-purple-100 text-purple-700" },
  published: { label: "已发布", variant: "bg-emerald-100 text-emerald-700" },
};

const typeMap: Record<string, { label: string; variant: string }> = {
  article: { label: "文章", variant: "bg-blue-50 text-blue-600" },
  report: { label: "报告", variant: "bg-purple-50 text-purple-600" },
  newsletter: { label: "通讯", variant: "bg-amber-50 text-amber-600" },
  social_post: { label: "社媒帖", variant: "bg-pink-50 text-pink-600" },
};

interface ContentItem {
  id: number;
  title: string;
  contentType: string;
  wordCount: number;
  status: string;
  createdAt: string;
  body?: string;
  summary?: string;
  tags?: string[];
}

const mockData: ContentItem[] = [
  { id: 1, title: "2026年一人公司趋势报告", contentType: "report", wordCount: 8500, status: "published", createdAt: "2026-04-09", body: "一人公司（One Person Company）正在成为全球创业的重要趋势。\n\n在 AI 技术的加持下，个人创业者可以独立完成从产品开发到市场推广的全流程。\n\n本报告深入分析了 2026 年一人公司的发展趋势、核心挑战与机遇。", summary: "2026年一人公司行业全景分析", tags: ["一人公司", "趋势报告", "2026"] },
  { id: 2, title: "AI 辅助内容生产实践指南", contentType: "article", wordCount: 3200, status: "review_pending", createdAt: "2026-04-08", body: "AI 正在重新定义内容生产的方式。\n\n从选题到撰写，从排版到分发，AI 工具可以显著提升内容创作者的效率。\n\n本文将分享我们在实践中总结的 AI 辅助内容生产最佳实践。", summary: "AI内容生产最佳实践总结", tags: ["AI", "内容生产", "效率"] },
  { id: 3, title: "深象科技周报 Vol.14", contentType: "newsletter", wordCount: 2100, status: "ready", createdAt: "2026-04-07", body: "本周要闻：\n\n1. OpenAI 发布新一代模型\n2. 国内自媒体平台政策更新\n3. 一人公司创业者社区活跃度创新高", summary: "第14期周报", tags: ["周报", "行业动态"] },
  { id: 4, title: "小红书爆款标题公式解析", contentType: "social_post", wordCount: 800, status: "writing", createdAt: "2026-04-06", body: "小红书爆款标题的核心公式：\n\n数字 + 痛点 + 解决方案\n\n例如：「3个月从0到10万粉，我只做对了这一件事」", summary: "小红书标题写作技巧", tags: ["小红书", "标题", "运营"] },
  { id: 5, title: "数据安全合规白皮书", contentType: "report", wordCount: 12000, status: "draft", createdAt: "2026-04-05", body: "随着数据安全法规的不断完善，一人公司创业者也需要重视数据合规问题。\n\n本白皮书梳理了创业者需要关注的核心合规要求。", summary: "创业者数据合规指南", tags: ["数据安全", "合规", "法规"] },
];

/* ── Content Detail / Editor View ── */
function ContentDetail({ item, onBack }: { item: ContentItem; onBack: () => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const [editorContent, setEditorContent] = useState<EditorContent>({
    title: item.title,
    body: item.body || "",
    summary: item.summary || "",
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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl btn-press" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-semibold text-lg">{item.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={item.contentType} map={typeMap} />
              <StatusBadge status={item.status} map={statusMap} />
              <span className="text-xs text-muted-foreground">{item.wordCount.toLocaleString()} 字</span>
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
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-xl border-border/50 btn-press"
            onClick={() => toast.info("提交审核功能即将上线")}
          >
            <Send className="h-3.5 w-3.5 mr-1.5" /> 提交审核
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground btn-press shadow-sm shadow-primary/20"
            onClick={() => toast.success("内容已保存")}
          >
            保存
          </Button>
        </div>
      </div>

      {/* Preview Panel */}
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
                    summary: editorContent.summary,
                    author: "深象科技",
                    publishDate: item.createdAt,
                    tags: editorContent.tags,
                    platform: "wechat_mp",
                  }}
                  onClose={() => setShowPreview(false)}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor */}
      <Card className="card-elevated border-border/30 rounded-2xl">
        <CardContent className="p-6">
          <ContentEditor
            initialContent={editorContent}
            onChange={setEditorContent}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── New Content View ── */
function NewContentView({ onBack }: { onBack: () => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const [editorContent, setEditorContent] = useState<EditorContent>({
    title: "",
    body: "",
    summary: "",
    tags: [],
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl btn-press" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-semibold text-lg">新建内容</h2>
            <p className="text-xs text-muted-foreground mt-0.5">支持 AI 生成和手动编辑两种模式</p>
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
          <Button
            size="sm"
            className="h-8 text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground btn-press shadow-sm shadow-primary/20"
            onClick={() => { toast.success("内容已保存为草稿"); onBack(); }}
          >
            保存草稿
          </Button>
        </div>
      </div>

      {/* Preview Panel */}
      <AnimatePresence>
        {showPreview && editorContent.title && (
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
                    title: editorContent.title || "未命名内容",
                    body: editorContent.body || "暂无内容",
                    summary: editorContent.summary,
                    author: "深象科技",
                    tags: editorContent.tags,
                    platform: "wechat_mp",
                  }}
                  onClose={() => setShowPreview(false)}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor */}
      <Card className="card-elevated border-border/30 rounded-2xl">
        <CardContent className="p-6">
          <ContentEditor onChange={setEditorContent} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function Contents() {
  const [view, setView] = useState<"list" | "detail" | "new">("list");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const columns = [
    {
      key: "title",
      label: "标题",
      render: (row: ContentItem) => (
        <button
          className="font-medium text-foreground hover:text-primary transition-colors text-left"
          onClick={() => { setSelectedItem(row); setView("detail"); }}
        >
          {row.title}
        </button>
      ),
    },
    { key: "contentType", label: "类型", render: (row: ContentItem) => <StatusBadge status={row.contentType} map={typeMap} /> },
    { key: "wordCount", label: "字数", render: (row: ContentItem) => <span>{row.wordCount.toLocaleString()}</span> },
    { key: "status", label: "状态", render: (row: ContentItem) => <StatusBadge status={row.status} map={statusMap} /> },
    { key: "createdAt", label: "创建时间" },
    {
      key: "actions",
      label: "操作",
      render: (row: ContentItem) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg btn-press"
            onClick={() => { setSelectedItem(row); setView("detail"); }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg btn-press"
            onClick={() => toast.info("复制功能即将上线")}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  if (view === "detail" && selectedItem) {
    return (
      <PageShell title="内容工厂" description="母稿生成与内容管理" icon={<FileText className="h-5 w-5" />}>
        <ContentDetail item={selectedItem} onBack={() => { setView("list"); setSelectedItem(null); }} />
      </PageShell>
    );
  }

  if (view === "new") {
    return (
      <PageShell title="内容工厂" description="母稿生成与内容管理" icon={<FileText className="h-5 w-5" />}>
        <NewContentView onBack={() => setView("list")} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="内容工厂"
      description="母稿生成与内容管理"
      icon={<FileText className="h-5 w-5" />}
      action={{ label: "新建内容", onClick: () => setView("new") }}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {[
          { label: "全部", value: mockData.length, color: "text-foreground" },
          { label: "草稿", value: mockData.filter(d => d.status === "draft" || d.status === "writing").length, color: "text-gray-600" },
          { label: "待审核", value: mockData.filter(d => d.status === "review_pending").length, color: "text-amber-600" },
          { label: "待发布", value: mockData.filter(d => d.status === "ready").length, color: "text-purple-600" },
          { label: "已发布", value: mockData.filter(d => d.status === "published").length, color: "text-emerald-600" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="card-elevated border-border/30 rounded-xl">
              <CardContent className="p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <DataTable columns={columns} data={mockData} searchPlaceholder="搜索内容..." />
    </PageShell>
  );
}
