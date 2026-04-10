import { useState } from "react";
import PageShell from "@/components/PageShell";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PlatformPreviewPanel from "@/components/PlatformPreview";
import {
  CheckCircle, Eye, ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare,
  Clock, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const statusMap: Record<string, { label: string; variant: string }> = {
  pending: { label: "待审核", variant: "bg-amber-100 text-amber-700" },
  approved: { label: "已通过", variant: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "已驳回", variant: "bg-red-100 text-red-700" },
  revision_needed: { label: "需修改", variant: "bg-blue-100 text-blue-700" },
};

interface ReviewItem {
  id: number;
  title: string;
  reviewer: string;
  status: string;
  score: string;
  createdAt: string;
  body?: string;
  tags?: string[];
}

const mockData: ReviewItem[] = [
  { id: 1, title: "AI 辅助内容生产实践指南", reviewer: "张三", status: "pending", score: "-", createdAt: "2026-04-09", body: "AI 正在重新定义内容生产的方式。从选题到撰写，从排版到分发，AI 工具可以显著提升内容创作者的效率。\n\n本文将分享我们在实践中总结的 AI 辅助内容生产最佳实践。\n\n第一步：选题阶段的 AI 辅助\n第二步：内容生成与优化\n第三步：多平台适配与分发", tags: ["AI", "内容生产"] },
  { id: 2, title: "2026年一人公司趋势报告", reviewer: "李四", status: "approved", score: "95", createdAt: "2026-04-08", body: "一人公司正在成为全球创业的重要趋势。在 AI 技术的加持下，个人创业者可以独立完成从产品开发到市场推广的全流程。", tags: ["一人公司", "趋势"] },
  { id: 3, title: "数据安全合规白皮书", reviewer: "王五", status: "revision_needed", score: "72", createdAt: "2026-04-07", body: "随着数据安全法规的不断完善，一人公司创业者也需要重视数据合规问题。", tags: ["数据安全", "合规"] },
  { id: 4, title: "小红书运营策略手册", reviewer: "张三", status: "rejected", score: "45", createdAt: "2026-04-06", body: "小红书运营的核心在于内容质量和用户互动。", tags: ["小红书", "运营"] },
  { id: 5, title: "深象科技周报 Vol.14", reviewer: "李四", status: "approved", score: "88", createdAt: "2026-04-05", body: "本周要闻：OpenAI 发布新模型，国内自媒体平台政策更新。", tags: ["周报"] },
];

/* ── Review Detail ── */
function ReviewDetail({ item, onBack }: { item: ReviewItem; onBack: () => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const [feedback, setFeedback] = useState("");

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
              <StatusBadge status={item.status} map={statusMap} />
              <span className="text-xs text-muted-foreground">审核人: {item.reviewer}</span>
              <span className="text-xs text-muted-foreground">评分: {item.score}</span>
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
                    title: item.title,
                    body: item.body || "",
                    author: "深象科技",
                    publishDate: item.createdAt,
                    tags: item.tags || [],
                    platform: "wechat_mp",
                  }}
                  onClose={() => setShowPreview(false)}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Preview */}
      <Card className="card-elevated border-border/30 rounded-2xl">
        <CardContent className="p-6">
          <h3 className="font-semibold text-base mb-4">内容正文</h3>
          <div className="text-[15px] leading-[1.9] text-muted-foreground space-y-3">
            {(item.body || "").split("\n").filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-border/20">
              {item.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-orange-50 text-orange-600 border-0 text-[11px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Actions */}
      <Card className="card-elevated border-border/30 rounded-2xl">
        <CardContent className="p-5">
          <h3 className="font-semibold text-sm mb-3">审核意见</h3>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="输入审核意见和修改建议..."
            rows={3}
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-border/40 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all mb-4"
          />
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              className="h-8 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white btn-press shadow-sm"
              onClick={() => { toast.success("已通过审核"); onBack(); }}
            >
              <ThumbsUp className="h-3.5 w-3.5 mr-1.5" /> 通过
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 btn-press"
              onClick={() => { toast.info("已标记需修改"); onBack(); }}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> 需修改
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs rounded-xl border-red-200 text-red-600 hover:bg-red-50 btn-press"
              onClick={() => { toast.error("已驳回"); onBack(); }}
            >
              <ThumbsDown className="h-3.5 w-3.5 mr-1.5" /> 驳回
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function Reviews() {
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);

  const columns = [
    {
      key: "title",
      label: "内容标题",
      render: (row: ReviewItem) => (
        <button
          className="font-medium text-foreground hover:text-primary transition-colors text-left"
          onClick={() => setSelectedItem(row)}
        >
          {row.title}
        </button>
      ),
    },
    { key: "reviewer", label: "审核人" },
    { key: "score", label: "评分" },
    { key: "status", label: "状态", render: (row: ReviewItem) => <StatusBadge status={row.status} map={statusMap} /> },
    { key: "createdAt", label: "提交时间" },
    {
      key: "actions",
      label: "操作",
      render: (row: ReviewItem) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg btn-press" onClick={() => setSelectedItem(row)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  if (selectedItem) {
    return (
      <PageShell title="审核台" description="内容质量审核与反馈" icon={<CheckCircle className="h-5 w-5" />}>
        <ReviewDetail item={selectedItem} onBack={() => setSelectedItem(null)} />
      </PageShell>
    );
  }

  return (
    <PageShell title="审核台" description="内容质量审核与反馈" icon={<CheckCircle className="h-5 w-5" />}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "待审核", value: mockData.filter(d => d.status === "pending").length, icon: <Clock className="h-4 w-4" />, color: "text-amber-600" },
          { label: "已通过", value: mockData.filter(d => d.status === "approved").length, icon: <ThumbsUp className="h-4 w-4" />, color: "text-emerald-600" },
          { label: "需修改", value: mockData.filter(d => d.status === "revision_needed").length, icon: <AlertTriangle className="h-4 w-4" />, color: "text-blue-600" },
          { label: "已驳回", value: mockData.filter(d => d.status === "rejected").length, icon: <ThumbsDown className="h-4 w-4" />, color: "text-red-600" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="card-elevated border-border/30 rounded-xl">
              <CardContent className="p-3 flex items-center gap-3">
                <span className={s.color}>{s.icon}</span>
                <div>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <DataTable columns={columns} data={mockData} searchPlaceholder="搜索审核任务..." />
    </PageShell>
  );
}
