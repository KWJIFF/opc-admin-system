import PageShell from "@/components/PageShell";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; variant: string }> = {
  draft: { label: "草稿", variant: "bg-gray-100 text-gray-600" },
  approved: { label: "已通过", variant: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "已驳回", variant: "bg-red-100 text-red-700" },
  in_production: { label: "生产中", variant: "bg-blue-100 text-blue-700" },
};

const mockData = [
  { id: 1, title: "2026年AI监管趋势深度解读", category: "政策解读", status: "approved", priority: "high", platforms: "公众号, 知乎", createdAt: "2026-04-09" },
  { id: 2, title: "一人公司如何构建内容飞轮", category: "商业策略", status: "in_production", priority: "medium", platforms: "公众号, 小红书", createdAt: "2026-04-08" },
  { id: 3, title: "GPT-5对内容创作者的影响", category: "AI 技术", status: "draft", priority: "high", platforms: "公众号, B站", createdAt: "2026-04-07" },
  { id: 4, title: "东南亚数字经济新机遇", category: "市场分析", status: "rejected", priority: "low", platforms: "公众号", createdAt: "2026-04-06" },
  { id: 5, title: "数据安全合规实操指南", category: "合规指南", status: "approved", priority: "urgent", platforms: "公众号, 知乎, 网站", createdAt: "2026-04-05" },
];

const columns = [
  { key: "title", label: "选题", render: (row: typeof mockData[0]) => <span className="font-medium text-foreground">{row.title}</span> },
  { key: "category", label: "分类" },
  { key: "platforms", label: "目标平台" },
  { key: "status", label: "状态", render: (row: typeof mockData[0]) => <StatusBadge status={row.status} map={statusMap} /> },
  { key: "createdAt", label: "创建时间" },
];

export default function Topics() {
  return (
    <PageShell
      title="选题中心"
      description="AI 辅助选题，管理内容选题库"
      icon={<Lightbulb className="h-5 w-5" />}
      action={{ label: "新建选题", onClick: () => toast.info("新建选题功能即将上线") }}
    >
      <DataTable columns={columns} data={mockData} searchPlaceholder="搜索选题..." />
    </PageShell>
  );
}
