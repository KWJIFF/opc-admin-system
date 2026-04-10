import PageShell from "@/components/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, TrendingUp, UserPlus, Download, Send, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const mockSubscribers = [
  { id: 1, email: "zhang@example.com", name: "张三", source: "首页订阅", status: "active", subscribedAt: "2026-04-10 09:00" },
  { id: 2, email: "li@example.com", name: "李四", source: "文章底部", status: "active", subscribedAt: "2026-04-09 15:30" },
  { id: 3, email: "wang@example.com", name: "王五", source: "工具图谱", status: "active", subscribedAt: "2026-04-08 11:20" },
  { id: 4, email: "zhao@example.com", name: "赵六", source: "首页订阅", status: "unsubscribed", subscribedAt: "2026-03-20 08:00" },
  { id: 5, email: "creator@example.com", name: "独立创作者", source: "关于页面", status: "active", subscribedAt: "2026-04-07 16:45" },
  { id: 6, email: "startup@example.com", name: "创业者小A", source: "首页订阅", status: "active", subscribedAt: "2026-04-06 10:00" },
];

function SubscriberStats() {
  const active = mockSubscribers.filter(s => s.status === "active").length;
  const stats = [
    { label: "总订阅者", value: mockSubscribers.length, icon: <Users className="h-4 w-4" />, color: "text-blue-600" },
    { label: "活跃订阅", value: active, icon: <Mail className="h-4 w-4" />, color: "text-emerald-600" },
    { label: "本周新增", value: 3, icon: <UserPlus className="h-4 w-4" />, color: "text-purple-600" },
    { label: "增长率", value: "+18%", icon: <TrendingUp className="h-4 w-4" />, color: "text-orange-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="card-elevated border-border/30 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={s.color}>{s.icon}</span>
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

export default function Subscribers() {
  return (
    <PageShell
      title="订阅管理"
      description="管理邮件订阅者，发送内容通知和运营邮件"
      icon={<Mail className="h-5 w-5" />}
      action={{ label: "导出订阅列表", onClick: () => toast.info("导出功能即将上线") }}
    >
      <SubscriberStats />

      {/* Subscriber List */}
      <Card className="card-elevated border-border/30 rounded-2xl mt-5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">订阅者列表</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg border-border/50 btn-press" onClick={() => toast.info("导出功能即将上线")}>
                <Download className="h-3 w-3 mr-1" />导出 CSV
              </Button>
              <Button size="sm" className="h-7 text-xs rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground btn-press" onClick={() => toast.info("群发邮件功能即将上线")}>
                <Send className="h-3 w-3 mr-1" />群发通知
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {mockSubscribers.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 bg-muted/10 hover:bg-muted/20 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{sub.name || sub.email}</p>
                      <Badge variant="secondary" className={`border-0 text-[10px] ${sub.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                        {sub.status === "active" ? "活跃" : "已退订"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{sub.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px] mb-0.5">{sub.source}</Badge>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                    <Clock className="h-2.5 w-2.5" />{sub.subscribedAt}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Campaign Card */}
      <Card className="card-elevated border-border/30 rounded-2xl mt-5">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">邮件推送</h3>
              <p className="text-[11px] text-muted-foreground">向订阅者发送内容更新通知和运营邮件</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "周报推送", desc: "每周一自动发送本周精选内容", status: "已启用", color: "text-emerald-600" },
              { label: "新文章通知", desc: "新文章发布后自动通知订阅者", status: "未启用", color: "text-muted-foreground" },
              { label: "活动邀请", desc: "线上/线下活动邀请邮件", status: "手动触发", color: "text-amber-600" },
            ].map((campaign) => (
              <div key={campaign.label} className="bg-muted/20 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{campaign.label}</p>
                  <span className={`text-[10px] font-medium ${campaign.color}`}>{campaign.status}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{campaign.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
