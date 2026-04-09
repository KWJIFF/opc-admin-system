import PageShell from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";

const modules = [
  { name: "仪表盘", key: "dashboard", admin: true, member: true },
  { name: "情报中心", key: "signals", admin: true, member: true },
  { name: "选题中心", key: "topics", admin: true, member: true },
  { name: "内容工厂", key: "contents", admin: true, member: true },
  { name: "审核台", key: "reviews", admin: true, member: false },
  { name: "发布台", key: "publish", admin: true, member: false },
  { name: "账号托管", key: "accounts", admin: true, member: false },
  { name: "内容日历", key: "calendar", admin: true, member: true },
  { name: "网站文章", key: "website", admin: true, member: true },
  { name: "报告中心", key: "reports", admin: true, member: true },
  { name: "数据洞察", key: "insights", admin: true, member: false },
  { name: "工作流", key: "workflows", admin: true, member: false },
  { name: "团队成员", key: "team", admin: true, member: false },
  { name: "权限管理", key: "permissions", admin: true, member: false },
  { name: "系统监控", key: "monitor", admin: true, member: false },
  { name: "来源管理", key: "sources", admin: true, member: false },
  { name: "系统设置", key: "settings", admin: true, member: false },
];

export default function Permissions() {
  return (
    <PageShell title="权限管理" description="基于角色的访问控制配置" icon={<Shield className="h-5 w-5" />}>
      <Card className="card-elevated border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">模块访问权限</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">模块</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0">管理员</Badge>
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">成员</Badge>
                  </th>
                </tr>
              </thead>
              <tbody>
                {modules.map((mod) => (
                  <tr key={mod.key} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{mod.name}</td>
                    <td className="px-4 py-3 text-center">
                      <Switch checked={mod.admin} disabled className="data-[state=checked]:bg-primary" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch checked={mod.member} className="data-[state=checked]:bg-blue-500" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
