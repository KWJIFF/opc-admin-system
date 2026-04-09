import { useState } from "react";
import PageShell from "@/components/PageShell";
import { StatusBadge } from "@/components/DataTable";
import { Send, ChevronDown, ChevronUp, Check, Clock, RotateCcw, ExternalLink, Zap, Eye } from "lucide-react";
import PlatformPreviewPanel from "@/components/PlatformPreview";
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

const mockContentMap: Record<number, { body: string; tags: string[] }> = {
  1: { body: "一人公司正在成为全球创业的重要趋势。在 AI 技术的加持下，个人创业者可以独立完成从产品开发到市场推广的全流程。\n\n本报告深入分析了 2026 年一人公司的发展趋势、核心挑战与机遇。", tags: ["一人公司", "趋势报告"] },
  2: { body: "AI 正在重新定义内容生产的方式。从选题到撰写，从排版到分发，AI 工具可以显著提升内容创作者的效率。", tags: ["AI", "内容生产"] },
  3: { body: "小红书爆款标题的核心公式：数字 + 痛点 + 解决方案。", tags: ["小红书", "运营"] },
  4: { body: "本周要闻：OpenAI 发布新模型，国内自媒体平台政策更新。", tags: ["周报"] },
  5: { body: "随着数据安全法规的不断完善，一人公司创业者也需要重视数据合规问题。", tags: ["数据安全", "合规"] },
};

/** 平台 ID 到 PlatformPreview 组件支持的 platform 值的映射 */
const platformIdToPreviewPlatform: Record<string, string> = {
  wechat: "wechat_mp",
  zhihu: "website",
  xiaohongshu: "xiaohongshu",
  douyin: "douyin",
  bilibili: "website",
  website: "website",
  toutiao: "website",
  weibo: "website",
};

function PublishCard({ item }: { item: PublishItem }) {
  const [expanded, setExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPlatformId, setPreviewPlatformId] = useState<string>(
    () => item.platforms.find(p => p.enabled)?.id || "wechat"
  );
  const [platforms, setPlatforms] = useState(item.platforms);
  const contentInfo = mockContentMap[item.id] || { body: "", tags: [] };

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
    <div className="card-elevated border-border/30 rounded-2xl bg-card">
      {/* Main row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/10 transition-colors duration-200 rounded-t-2xl"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <h3 className="font-semibold text-[14px] text-foreground truncate">{item.title}</h3>
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
          className="text-muted-foreground rounded-xl btn-press h-8 w-8 p-0"
          onClick={(e) => { e.stopPropagation(); setShowPreview(!showPreview); }}
          title="预览"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground rounded-xl btn-press"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Preview Panel */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-border/30 pt-4">
              {/* 平台切换按钮 */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-muted-foreground">预览平台：</span>
                <div className="flex gap-1.5 flex-wrap">
                  {platforms.filter(p => p.enabled).map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPreviewPlatformId(p.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        previewPlatformId === p.id
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-muted/30 text-muted-foreground border border-transparent hover:bg-muted/50"
                      }`}
                    >
                      <span>{p.icon}</span> {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <PlatformPreviewPanel
                content={{
                  title: item.title,
                  body: contentInfo.body,
                  author: "深象科技",
                  publishDate: item.createdAt,
                  tags: contentInfo.tags,
                  platform: platformIdToPreviewPlatform[previewPlatformId] || "wechat_mp",
                }}
                defaultPlatform={platformIdToPreviewPlatform[previewPlatformId] || "wechat_mp"}
                onClose={() => setShowPreview(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="px-5 pb-5 border-t border-border/30 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-foreground">分发目标平台</h4>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white gap-1.5 rounded-xl btn-press shadow-sm shadow-primary/20"
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
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl border transition-all duration-200 ${
                      p.enabled ? "border-primary/20 bg-primary/[0.04]" : "border-border/30 bg-muted/20"
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
