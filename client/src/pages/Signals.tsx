import PageShell from "@/components/PageShell";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { Radar } from "lucide-react";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; variant: string }> = {
  new: { label: "新信号", variant: "bg-blue-100 text-blue-700" },
  processing: { label: "处理中", variant: "bg-amber-100 text-amber-700" },
  archived: { label: "已归档", variant: "bg-gray-100 text-gray-600" },
  converted: { label: "已转化", variant: "bg-emerald-100 text-emerald-700" },
};

const priorityMap: Record<string, { label: string; variant: string }> = {
  low: { label: "低", variant: "bg-gray-100 text-gray-600" },
  medium: { label: "中", variant: "bg-blue-100 text-blue-700" },
  high: { label: "高", variant: "bg-orange-100 text-orange-700" },
  urgent: { label: "紧急", variant: "bg-red-100 text-red-700" },
};

const mockData = [
  { id: 1, title: "OpenAI 发布 GPT-5 模型", source: "TechCrunch", category: "AI 技术", priority: "high", status: "new", createdAt: "2026-04-09" },
  { id: 2, title: "中国发布新版数据安全管理条例", source: "新华社", category: "政策法规", priority: "urgent", status: "processing", createdAt: "2026-04-08" },
  { id: 3, title: "一人公司模式在东南亚快速增长", source: "Bloomberg", category: "商业趋势", priority: "medium", status: "new", createdAt: "2026-04-07" },
  { id: 4, title: "Stripe 推出 AI 自动化收款功能", source: "Stripe Blog", category: "金融科技", priority: "medium", status: "converted", createdAt: "2026-04-06" },
  { id: 5, title: "Google 发布 Gemini 2.0 Ultra", source: "Google Blog", category: "AI 技术", priority: "high", status: "archived", createdAt: "2026-04-05" },
];

const columns = [
  { key: "title", label: "标题", render: (row: typeof mockData[0]) => <span className="font-medium text-foreground">{row.title}</span> },
  { key: "source", label: "来源" },
  { key: "category", label: "分类" },
  { key: "priority", label: "优先级", render: (row: typeof mockData[0]) => <StatusBadge status={row.priority} map={priorityMap} /> },
  { key: "status", label: "状态", render: (row: typeof mockData[0]) => <StatusBadge status={row.status} map={statusMap} /> },
  { key: "createdAt", label: "采集时间" },
];

export default function Signals() {
  return (
    <PageShell
      title="情报中心"
      description="采集和管理行业信号与情报"
      icon={<Radar className="h-5 w-5" />}
      action={{ label: "新增信号", onClick: () => toast.info("新增信号功能即将上线") }}
    >
      <DataTable columns={columns} data={mockData} searchPlaceholder="搜索信号..." />
    </PageShell>
  );
}
