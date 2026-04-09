import { useState } from "react";
import PageShell from "@/components/PageShell";
import { StatusBadge } from "@/components/DataTable";
import { Send, ChevronDown, ChevronUp, Check, Clock, RotateCcw, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const statusMap: Record<string, { label: string; variant: string }> = {
  queued: { label: "排队中", variant: "bg-gray-100 text-gray-600" },
  scheduled: { label: "已排期", variant: "bg-blue-100 text-blue-700" },
  publishing: { label: "发布中", variant: "bg-amber-100 text-amber-700" },
  published: { label: "已发布", variant: "bg-emerald-100 text-emerald-700" },
  failed: { label: "失败", variant: "bg-red-100 text-red-700" },
};

const modeMap: Record<string, { label: string; variant: string }> = {
  manual: { label: "手动", variant: "bg-gray-100 text-gray-600" },
  semi_auto: { label: "半自动", variant: "bg-blue-100 text-blue-700" },
  auto: { label: "全自动", variant: "bg-emerald-100 text-emerald-700" },
};

interface PlatformTarget {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  status: "idle" | "publishing" | "published" | "failed";
  scheduledAt?: string;
}

interface PublishItem {
  id: number;
  title: string;
  platforms: PlatformTarget[];
  status: string;
  publishMode: string;
  createdAt: string;
}

const mockData: PublishItem[] = [
  {
    id: 1, title: "2026年一人公司趋势报告", status: "published", publishMode: "semi_auto", createdAt: "2026-04-09 10:00",
    platforms: [
      { id: "wechat", name: "微信公众号", icon: "💬", enabled: true, status: "published" },
      { id: "zhihu", name: "知乎", icon: "📘", enabled: true, status: "published" },
      { id: "xiaohongshu", name: "小红书", icon: "📕", enabled: false, status: "idle" },
      { id: "website", name: "官网", icon: "🌐", enabled: true, status: "published" },
    ],
  },
  {
    id: 2, title: "AI 辅助内容生产实践指南", status: "scheduled", publishMode: "manual", createdAt: "2026-04-10 09:00",
    platforms: [
      { id: "wechat", name: "微信公众号", icon: "💬", enabled: true, status: "idle", scheduledAt: "2026-04-10 09:00" },
      { id: "zhihu", name: "知乎", icon: "📘", enabled: true, status: "idle", scheduledAt: "2026-04-10 10:00" },
      { id: "xiaohongshu", name: "小红书", icon: "📕", enabled: true, status: "idle", scheduledAt: "2026-04-10 14:00" },
      { id: "douyin", name: "抖音", icon: "🎵", enabled: false, status: "idle" },
      { id: "bilibili", name: "B站", icon: "📺", enabled: false, status: "idle" },
      { id: "website", name: "官网", icon: "🌐", enabled: true, status: "idle", scheduledAt: "2026-04-10 08:00" },
    ],
  },
  {
    id: 3, title: "小红书爆款标题公式", status: "queued", publishMode: "semi_auto", createdAt: "2026-04-10 14:00",
    platforms: [
      { id: "xiaohongshu", name: "小红书", icon: "📕", enabled: true, status: "idle" },
      { id: "wechat", name: "微信公众号", icon: "💬", enabled: false, status: "idle" },
    ],
  },
  {
    id: 4, title: "深象科技周报 Vol.14", status: "failed", publishMode: "manual", createdAt: "2026-04-08 18:00",
    platforms: [
      { id: "wechat", name: "微信公众号", icon: "💬", enabled: true, status: "published" },
      { id: "bilibili", name: "B站", icon: "📺", enabled: true, status: "failed" },
      { id: "website", name: "官网", icon: "🌐", enabled: true, status: "published" },
    ],
  },
  {
    id: 5, title: "数据安全合规白皮书", status: "publishing", publishMode: "semi_auto", createdAt: "2026-04-09 15:00",
    platforms: [
      { id: "wechat", name: "微信公众号", icon: "💬", enabled: true, status: "published" },
      { id: "zhihu", name: "知乎", icon: "📘", enabled: true, status: "publishing" },
      { id: "website", name: "官网", icon: "🌐", enabled: true, status: "published" },
    ],
  },
];

function PlatformStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    idle: "bg-gray-300",
    publishing: "bg-amber-400 animate-pulse",
    published: "bg-emerald-500",
    failed: "bg-red-500",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status] || colors.idle}`} />;
}

function PublishCard({ item }: { item: PublishItem }) {
  const [expanded, setExpanded] = useState(false);
  const [platforms, setPlatforms] = useState(item.platforms);

  const enabledCount = platforms.filter(p => p.enabled).length;
  const publishedCount = platforms.filter(p => p.status === "published").length;
  const failedCount = platforms.filter(p => p.status === "failed").length;

  const togglePlatform = (platformId: string) => {
    setPlatforms(prev => prev.map(p => p.id === platformId ? { ...p, enabled: !p.enabled } : p));
  };

  const handleDistribute = () => {
    const targets = platforms.filter(p => p.enabled && p.status === "idle").map(p => p.name);
    if (targets.length === 0) {
      toast.info("没有需要发布的平台");
      return;
    }
    toast.success(`正在分发到 ${targets.join("、")}`, { description: "分发任务已创建，请在各平台确认" });
  };

  const handleRetry = (platformId: string) => {
    const p = platforms.find(p => p.id === platformId);
    if (p) toast.info(`正在重试发布到 ${p.name}...`);
  };

  return (
    <div className="border border-border/60 rounded-xl bg-white hover:shadow-sm transition-shadow">
      {/* Main row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <h3 className="font-medium text-foreground truncate">{item.title}</h3>
            <StatusBadge status={item.status} map={statusMap} />
            <StatusBadge status={item.publishMode} map={modeMap} />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{item.createdAt}</span>
            <span className="flex items-center gap-1">
              <Send className="h-3 w-3" />
              {enabledCount} 个平台
            </span>
            {publishedCount > 0 && (
              <span className="flex items-center gap-1 text-emerald-600">
                <Check className="h-3 w-3" /> 已发布 {publishedCount}
              </span>
            )}
            {failedCount > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                失败 {failedCount}
              </span>
            )}
          </div>
        </div>

        {/* Platform preview dots */}
        <div className="flex items-center gap-1.5">
          {platforms.filter(p => p.enabled).map(p => (
            <div key={p.id} className="flex items-center gap-1 text-xs" title={`${p.name}: ${p.status}`}>
              <span>{p.icon}</span>
              <PlatformStatusDot status={p.status} />
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Expanded distribution panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-border/40 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-foreground">分发目标平台</h4>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white gap-1.5"
                  onClick={handleDistribute}
                >
                  <Zap className="h-3.5 w-3.5" />
                  一键分发
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {platforms.map(p => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-colors ${
                      p.enabled ? "border-primary/20 bg-primary/5" : "border-border/40 bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{p.icon}</span>
                      <div>
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <PlatformStatusDot status={p.status} />
                          {p.status === "published" && "已发布"}
                          {p.status === "publishing" && "发布中..."}
                          {p.status === "failed" && (
                            <button
                              className="text-red-600 hover:underline flex items-center gap-0.5"
                              onClick={() => handleRetry(p.id)}
                            >
                              失败 <RotateCcw className="h-3 w-3" />
                            </button>
                          )}
                          {p.status === "idle" && p.scheduledAt && (
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-3 w-3" /> {p.scheduledAt}
                            </span>
                          )}
                          {p.status === "idle" && !p.scheduledAt && "待发布"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.status === "published" && (
                        <button className="text-muted-foreground hover:text-primary" title="查看">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <Switch
                        checked={p.enabled}
                        onCheckedChange={() => togglePlatform(p.id)}
                        className="scale-75"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Publish() {
  return (
    <PageShell
      title="发布台"
      description="管理内容发布任务，支持可选的一键多平台分发"
      icon={<Send className="h-5 w-5" />}
      action={{ label: "新建发布", onClick: () => toast.info("新建发布任务功能即将上线") }}
    >
      <div className="space-y-3">
        {mockData.map(item => (
          <PublishCard key={item.id} item={item} />
        ))}
      </div>
    </PageShell>
  );
}
