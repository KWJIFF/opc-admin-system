import PageShell from "@/components/PageShell";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { FileText } from "lucide-react";
import { toast } from "sonner";

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

const mockData = [
  { id: 1, title: "2026年一人公司趋势报告", contentType: "report", wordCount: 8500, status: "published", createdAt: "2026-04-09" },
  { id: 2, title: "AI 辅助内容生产实践指南", contentType: "article", wordCount: 3200, status: "review_pending", createdAt: "2026-04-08" },
  { id: 3, title: "深象科技周报 Vol.14", contentType: "newsletter", wordCount: 2100, status: "ready", createdAt: "2026-04-07" },
  { id: 4, title: "小红书爆款标题公式解析", contentType: "social_post", wordCount: 800, status: "writing", createdAt: "2026-04-06" },
  { id: 5, title: "数据安全合规白皮书", contentType: "report", wordCount: 12000, status: "draft", createdAt: "2026-04-05" },
];

const columns = [
  { key: "title", label: "标题", render: (row: typeof mockData[0]) => <span className="font-medium text-foreground">{row.title}</span> },
  { key: "contentType", label: "类型", render: (row: typeof mockData[0]) => <StatusBadge status={row.contentType} map={typeMap} /> },
  { key: "wordCount", label: "字数", render: (row: typeof mockData[0]) => <span>{row.wordCount.toLocaleString()}</span> },
  { key: "status", label: "状态", render: (row: typeof mockData[0]) => <StatusBadge status={row.status} map={statusMap} /> },
  { key: "createdAt", label: "创建时间" },
];

export default function Contents() {
  return (
    <PageShell
      title="内容工厂"
      description="母稿生成与内容管理"
      icon={<FileText className="h-5 w-5" />}
      action={{ label: "新建内容", onClick: () => toast.info("新建内容功能即将上线") }}
    >
      <DataTable columns={columns} data={mockData} searchPlaceholder="搜索内容..." />
    </PageShell>
  );
}
