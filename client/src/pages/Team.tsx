import PageShell from "@/components/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Mail, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const mockMembers = [
  { id: 1, name: "张三", email: "zhangsan@shenxiang.tech", role: "admin", status: "active", lastSignedIn: "2026-04-09 10:30" },
  { id: 2, name: "李四", email: "lisi@shenxiang.tech", role: "admin", status: "active", lastSignedIn: "2026-04-09 09:15" },
  { id: 3, name: "王五", email: "wangwu@shenxiang.tech", role: "user", status: "active", lastSignedIn: "2026-04-08 18:00" },
  { id: 4, name: "赵六", email: "zhaoliu@shenxiang.tech", role: "user", status: "invited", lastSignedIn: "-" },
];

const roleConfig: Record<string, { label: string; variant: string }> = {
  admin: { label: "管理员", variant: "bg-primary/10 text-primary" },
  user: { label: "成员", variant: "bg-blue-100 text-blue-700" },
};

const statusConfig: Record<string, { label: string; variant: string }> = {
  active: { label: "活跃", variant: "bg-emerald-100 text-emerald-700" },
  inactive: { label: "未激活", variant: "bg-gray-100 text-gray-600" },
  invited: { label: "已邀请", variant: "bg-amber-100 text-amber-700" },
};

export default function Team() {
  return (
    <PageShell
      title="团队成员"
      description="管理团队成员与邀请"
      icon={<Users className="h-5 w-5" />}
      action={{ label: "邀请成员", onClick: () => toast.info("邀请成员功能即将上线") }}
    >
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {mockMembers.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border/50">
                    <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{member.name}</span>
                      <Badge variant="secondary" className={`${roleConfig[member.role].variant} border-0 text-[11px]`}>
                        {roleConfig[member.role].label}
                      </Badge>
                      <Badge variant="secondary" className={`${statusConfig[member.status].variant} border-0 text-[11px]`}>
                        {statusConfig[member.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{member.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    最近登录: {member.lastSignedIn}
                  </span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast.info("功能即将上线")}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
