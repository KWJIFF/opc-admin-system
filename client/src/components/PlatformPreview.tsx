import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Monitor, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Types ── */
export interface PreviewContent {
  title: string;
  summary?: string;
  body: string;
  coverImage?: string;
  author?: string;
  publishDate?: string;
  tags?: string[];
  platform?: string;
}

/* ── WeChat MP Preview ── */
function WechatPreview({ content }: { content: PreviewContent }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg max-w-[375px] mx-auto">
      {/* WeChat Status Bar */}
      <div className="bg-[#ededed] px-4 py-2 flex items-center justify-between">
        <span className="text-[11px] text-gray-500">9:41</span>
        <span className="text-[11px] font-medium text-gray-700">微信公众号</span>
        <div className="flex gap-1">
          <div className="w-3.5 h-2 border border-gray-400 rounded-sm relative">
            <div className="absolute inset-0.5 bg-gray-400 rounded-[1px]" style={{ width: "60%" }} />
          </div>
        </div>
      </div>

      {/* Article Header */}
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-[17px] font-bold leading-[1.5] text-[#1a1a1a] mb-3">
          {content.title}
        </h1>
        <div className="flex items-center gap-2 text-[12px] text-[#999]">
          <span className="text-[#576b95]">{content.author || "深象科技"}</span>
          <span>{content.publishDate || "2026-04-09"}</span>
        </div>
      </div>

      {/* Cover Image */}
      {content.coverImage ? (
        <div className="px-5 mb-4">
          <div className="w-full aspect-[2.35/1] bg-gradient-to-br from-orange-100 to-amber-50 rounded-lg flex items-center justify-center">
            <span className="text-sm text-orange-400">封面图</span>
          </div>
        </div>
      ) : (
        <div className="px-5 mb-4">
          <div className="w-full aspect-[2.35/1] bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg flex items-center justify-center border border-orange-100">
            <span className="text-xs text-orange-300">暂无封面图</span>
          </div>
        </div>
      )}

      {/* Article Body */}
      <div className="px-5 pb-6">
        <div className="text-[15px] leading-[1.8] text-[#3e3e3e] space-y-3">
          {content.body.split("\n").filter(Boolean).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[12px] text-[#999]">
          <span>阅读 1.2k</span>
          <span>在看 86</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[12px] text-[#576b95]">分享</button>
          <button className="text-[12px] text-[#576b95]">收藏</button>
        </div>
      </div>
    </div>
  );
}

/* ── Xiaohongshu Preview ── */
function XiaohongshuPreview({ content }: { content: PreviewContent }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg max-w-[375px] mx-auto">
      {/* Status Bar */}
      <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-50">
        <span className="text-[11px] text-gray-500">9:41</span>
        <span className="text-[11px] font-medium text-gray-700">小红书</span>
        <div className="w-8" />
      </div>

      {/* Cover Image - Square for XHS */}
      <div className="aspect-[3/4] bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center relative">
        {content.coverImage ? (
          <span className="text-sm text-rose-400">封面图 3:4</span>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📝</span>
            </div>
            <span className="text-xs text-rose-300">点击上传封面图</span>
          </div>
        )}
        {/* Slide Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">深</span>
          </div>
          <div>
            <p className="text-[13px] font-medium text-gray-800">{content.author || "深象科技"}</p>
            <p className="text-[10px] text-gray-400">{content.publishDate || "2026-04-09"}</p>
          </div>
          <button className="ml-auto px-3 py-1 bg-[#ff2442] text-white text-[11px] rounded-full font-medium">
            关注
          </button>
        </div>

        {/* Title */}
        <h1 className="text-[16px] font-bold leading-[1.4] text-gray-900 mb-2">
          {content.title}
        </h1>

        {/* Body - truncated for XHS style */}
        <div className="text-[14px] leading-[1.7] text-gray-700 mb-3">
          {content.body.split("\n").filter(Boolean).slice(0, 3).map((p, i) => (
            <p key={i} className="mb-1.5">{p}</p>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(content.tags || ["一人公司", "创业", "独立开发"]).map(tag => (
            <span key={tag} className="text-[11px] text-[#ff2442] bg-red-50 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* Engagement Bar */}
        <div className="flex items-center justify-around pt-3 border-t border-gray-100">
          <button className="flex items-center gap-1 text-[12px] text-gray-500">❤️ 328</button>
          <button className="flex items-center gap-1 text-[12px] text-gray-500">⭐ 156</button>
          <button className="flex items-center gap-1 text-[12px] text-gray-500">💬 42</button>
          <button className="flex items-center gap-1 text-[12px] text-gray-500">↗️ 分享</button>
        </div>
      </div>
    </div>
  );
}

/* ── Douyin Preview ── */
function DouyinPreview({ content }: { content: PreviewContent }) {
  return (
    <div className="bg-black rounded-2xl overflow-hidden shadow-lg max-w-[375px] mx-auto text-white">
      {/* Status Bar */}
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-[11px] text-white/60">9:41</span>
        <div className="flex gap-4 text-[12px]">
          <span className="text-white/50">关注</span>
          <span className="text-white font-medium border-b-2 border-white pb-0.5">推荐</span>
        </div>
        <div className="w-8" />
      </div>

      {/* Video Area */}
      <div className="aspect-[9/16] bg-gradient-to-b from-gray-900 to-gray-800 relative flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">▶️</span>
          </div>
          <span className="text-xs text-white/40">视频/图文预览区域</span>
        </div>

        {/* Right Action Bar */}
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center mb-1">
              <span className="text-white text-xs font-bold">深</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-[#fe2c55] flex items-center justify-center -mt-2.5 mx-auto border-2 border-black">
              <span className="text-white text-[8px]">+</span>
            </div>
          </div>
          <div className="text-center">
            <span className="text-lg">❤️</span>
            <p className="text-[10px] text-white/70 mt-0.5">2.8w</p>
          </div>
          <div className="text-center">
            <span className="text-lg">💬</span>
            <p className="text-[10px] text-white/70 mt-0.5">1568</p>
          </div>
          <div className="text-center">
            <span className="text-lg">⭐</span>
            <p className="text-[10px] text-white/70 mt-0.5">4231</p>
          </div>
          <div className="text-center">
            <span className="text-lg">↗️</span>
            <p className="text-[10px] text-white/70 mt-0.5">分享</p>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute left-3 bottom-4 right-16">
          <p className="text-[13px] font-medium mb-1">@{content.author || "深象科技"}</p>
          <p className="text-[13px] leading-[1.5] mb-2 line-clamp-3">
            {content.title}
          </p>
          <p className="text-[12px] text-white/60 line-clamp-2 mb-2">
            {content.body.split("\n")[0]?.slice(0, 80)}...
          </p>
          <div className="flex flex-wrap gap-1">
            {(content.tags || ["一人公司", "创业"]).map(tag => (
              <span key={tag} className="text-[11px] text-white/80">#{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-around py-2 bg-black border-t border-white/10">
        <span className="text-[10px] text-white/40">首页</span>
        <span className="text-[10px] text-white/40">朋友</span>
        <div className="w-10 h-6 bg-white rounded-md flex items-center justify-center">
          <span className="text-black text-[10px] font-bold">+</span>
        </div>
        <span className="text-[10px] text-white/40">消息</span>
        <span className="text-[10px] text-white/40">我</span>
      </div>
    </div>
  );
}

/* ── Website Preview ── */
function WebsitePreview({ content }: { content: PreviewContent }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg max-w-[680px] mx-auto border border-gray-100">
      {/* Browser Chrome */}
      <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[11px] text-gray-400 border border-gray-200 ml-2">
          opcs.vip/article/{content.title.slice(0, 10)}...
        </div>
      </div>

      {/* Site Header */}
      <div className="px-8 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">深</span>
          </div>
          <span className="font-semibold text-sm text-gray-800">深象 × OPCS</span>
        </div>
        <div className="flex gap-4 text-[12px] text-gray-500">
          <span>首页</span>
          <span>快讯</span>
          <span>研究</span>
          <span className="text-orange-600 font-medium">文章</span>
        </div>
      </div>

      {/* Article Content */}
      <div className="px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-4">
          <span>首页</span>
          <span>/</span>
          <span className="text-orange-600">{content.tags?.[0] || "文章"}</span>
        </div>

        {/* Title */}
        <h1 className="text-[22px] font-bold leading-[1.4] text-gray-900 mb-3">
          {content.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[12px] text-gray-400 mb-6 pb-4 border-b border-gray-100">
          <span>{content.author || "深象科技"}</span>
          <span>·</span>
          <span>{content.publishDate || "2026-04-09"}</span>
          <span>·</span>
          <span>阅读 5 分钟</span>
        </div>

        {/* Body */}
        <div className="text-[15px] leading-[1.9] text-gray-700 space-y-4">
          {content.body.split("\n").filter(Boolean).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-100">
          {(content.tags || ["一人公司", "创业"]).map(tag => (
            <span key={tag} className="text-[11px] text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Platform Preview Selector ── */
const platformPreviewMap: Record<string, { label: string; component: React.FC<{ content: PreviewContent }> }> = {
  wechat_mp: { label: "微信公众号", component: WechatPreview },
  xiaohongshu: { label: "小红书", component: XiaohongshuPreview },
  douyin: { label: "抖音", component: DouyinPreview },
  website: { label: "官方网站", component: WebsitePreview },
  zhihu: { label: "官方网站", component: WebsitePreview },
  bilibili: { label: "官方网站", component: WebsitePreview },
  toutiao: { label: "官方网站", component: WebsitePreview },
  weibo: { label: "官方网站", component: WebsitePreview },
};

/* ── Main Export: Multi-Platform Preview Panel ── */
export default function PlatformPreviewPanel({ content, defaultPlatform, onClose }: {
  content: PreviewContent;
  defaultPlatform?: string;
  onClose?: () => void;
}) {
  const availablePlatforms = Object.entries(platformPreviewMap);
  const [activePlatform, setActivePlatform] = useState(defaultPlatform || "wechat_mp");

  // Sync with external defaultPlatform changes
  useEffect(() => {
    if (defaultPlatform) setActivePlatform(defaultPlatform);
  }, [defaultPlatform]);
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const ActiveComponent = platformPreviewMap[activePlatform]?.component || WechatPreview;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`${isFullscreen ? "fixed inset-0 z-50 bg-white" : "relative"}`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {availablePlatforms.slice(0, 4).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setActivePlatform(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activePlatform === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-lg ${viewMode === "mobile" ? "bg-muted" : ""}`}
            onClick={() => setViewMode("mobile")}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-lg ${viewMode === "desktop" ? "bg-muted" : ""}`}
            onClick={() => setViewMode("desktop")}
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className={`overflow-y-auto bg-gray-50/50 p-6 ${isFullscreen ? "h-[calc(100vh-52px)]" : "max-h-[70vh]"}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePlatform}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={viewMode === "mobile" ? "max-w-[400px] mx-auto" : "max-w-[720px] mx-auto"}
          >
            <ActiveComponent content={content} />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Export individual previews for direct use ── */
export { WechatPreview, XiaohongshuPreview, DouyinPreview, WebsitePreview };
