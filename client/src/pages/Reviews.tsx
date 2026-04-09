import PageShell from "@/components/PageShell";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { CheckCircle } from "lucide-react";

const statusMap: Record<string, { label: string; variant: string }> = {
  pending: { label: "待审核", variant: "bg-amber-100 text-amber-700" },
  approved: { label: "已通过", variant: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "已驳回", variant: "bg-red-100 text-red-700" },
  revision_needed: { label: "需修改", variant: "bg-blue-100 text-blue-700" },
};

const mockData = [
  { id: 1, title: "AI 辅助内容生产实践指南", reviewer: "张三", status: "pending", score: "-", createdAt: "2026-04-09" },
  { id: 2, title: "2026年一人公司趋势报告", reviewer: "李四", status: "approved", score: "95", createdAt: "2026-04-08" },
  { id: 3, title: "数据安全合规白皮书", reviewer: "王五", status: "revision_needed", score: "72", createdAt: "2026-04-07" },
  { id: 4, title: "小红书运营策略手册", reviewer: "张三", status: "rejected", score: "45", createdAt: "2026-04-06" },
  { id: 5, title: "深象科技周报 Vol.14", reviewer: "李四", status: "approved", score: "88", createdAt: "2026-04-05" },
];

const columns = [
  { key: "title", label: "内容标题", render: (row: typeof mockData[0]) => <span className="font-medium text-foreground">{row.title}</span> },
  { key: "reviewer", label: "审核人" },
  { key: "score", label: "评分" },
  { key: "status", label: "状态", render: (row: typeof mockData[0]) => <StatusBadge status={row.status} map={statusMap} /> },
  { key: "createdAt", label: "提交时间" },
];

export default function Reviews() {
  return (
    <PageShell title="审核台" description="内容质量审核与反馈" icon={<CheckCircle className="h-5 w-5" />}>
      <DataTable columns={columns} data={mockData} searchPlaceholder="搜索审核任务..." />
    </PageShell>
  );
}
