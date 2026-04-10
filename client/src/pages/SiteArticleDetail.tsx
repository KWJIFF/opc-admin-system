import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft, Clock, User, Tag, Share2, Eye, MessageCircle,
  Play, Headphones, Download, Bookmark, Heart, Send, ChevronRight,
} from "lucide-react";
import { getCategoryIcon } from "@/components/SiteLayout";
import {
  getArticleById, getCategoryByKey, getRelatedArticles, formatDuration, formatCount,
} from "@shared/siteConfig";
import { toast } from "sonner";

export default function SiteArticleDetail() {
  const params = useParams<{ id: string }>();
  const articleId = parseInt(params.id || "0", 10);
  const article = getArticleById(articleId);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState("");

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">文章不存在或已被移除</p>
        <Link href="/site"><span className="text-primary hover:underline text-sm">返回首页</span></Link>
      </div>
    );
  }

  const cat = getCategoryByKey(article.categoryKey);
  const Icon = cat ? getCategoryIcon(cat.iconName) : null;
  const related = getRelatedArticles(articleId, 4);
  const isVideo = article.mediaType === "video";
  const isPodcast = article.mediaType === "podcast";
  const isReport = article.mediaType === "report";

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("链接已复制到剪贴板");
    }
  };

  const handleLike = () => { setLiked(!liked); toast.success(liked ? "已取消点赞" : "感谢点赞！"); };
  const handleBookmark = () => { setBookmarked(!bookmarked); toast.success(bookmarked ? "已取消收藏" : "已收藏到书签"); };
  const handleComment = () => {
    if (!commentText.trim()) { toast.error("请输入评论内容"); return; }
    toast.success("评论已提交，审核通过后将显示");
    setCommentText("");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="pt-1 sm:pt-2 pb-4 sm:pb-6">
        <Link href={cat?.path || "/site"}>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95 py-1">
            <ArrowLeft className="h-4 w-4" />返回{cat?.label || "首页"}
          </span>
        </Link>
      </motion.div>

      <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Category + Media Type Badge */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          {cat && (
            <Link href={cat.path}>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/6 text-primary text-xs font-medium">
                {Icon && <Icon className="h-3 w-3" />}{cat.label}
              </span>
            </Link>
          )}
          {isVideo && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-medium"><Play className="h-2.5 w-2.5" />视频</span>}
          {isPodcast && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-medium"><Headphones className="h-2.5 w-2.5" />播客</span>}
          {isReport && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-medium"><Download className="h-2.5 w-2.5" />报告</span>}
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-[32px] font-bold text-foreground tracking-tight leading-[1.3] sm:leading-snug mb-4 sm:mb-5">{article.title}</h1>

        {/* Meta */}
        <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-[13px] sm:text-sm text-muted-foreground/60 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-border/40">
          <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{article.author}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{article.readTime}</span>
          <span>{article.date}</span>
          {article.viewCount && <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{formatCount(article.viewCount)}</span>}
          {article.duration && <span className="flex items-center gap-1"><Play className="h-3.5 w-3.5" />{formatDuration(article.duration)}</span>}
        </div>

        {/* Video Player Placeholder */}
        {isVideo && (
          <div className="mb-6 sm:mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 aspect-video flex items-center justify-center relative">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/20 transition-colors active:scale-95" onClick={() => toast.info("视频播放功能即将上线")}>
                <Play className="h-8 w-8 text-white ml-1" />
              </div>
              <p className="text-white/60 text-sm">点击播放</p>
            </div>
            {article.duration && <span className="absolute bottom-4 right-4 px-2 py-1 rounded-lg bg-black/60 text-white text-xs font-medium">{formatDuration(article.duration)}</span>}
          </div>
        )}

        {/* Audio Player Placeholder */}
        {isPodcast && (
          <div className="mb-6 sm:mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-25 border border-purple-100">
            <div className="flex items-center gap-4">
              <button onClick={() => toast.info("音频播放功能即将上线")} className="shrink-0 w-14 h-14 rounded-full bg-purple-500 text-white flex items-center justify-center hover:bg-purple-600 active:scale-95 transition-all shadow-lg shadow-purple-200">
                <Play className="h-6 w-6 ml-0.5" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="h-2 bg-purple-200/50 rounded-full mb-2 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-0 bg-purple-500 rounded-full" />
                </div>
                <div className="flex items-center justify-between text-xs text-purple-400">
                  <span>0:00</span>
                  <span>{article.duration ? formatDuration(article.duration) : "--:--"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-6 sm:mb-8">
            <Tag className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            {article.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-md bg-secondary text-xs font-medium text-secondary-foreground">{t}</span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="mb-8 sm:mb-10">
          <p className="text-[15px] sm:text-base leading-[1.8] sm:leading-relaxed text-foreground/80 mb-6">{article.summary}</p>
          <div className="p-5 sm:p-6 rounded-xl bg-secondary/50 border border-border/30 text-center">
            <p className="text-muted-foreground text-sm">完整内容将通过后台内容管理系统发布后展示。</p>
            <p className="text-muted-foreground/50 text-xs mt-2">当前为预览模式</p>
          </div>
        </div>

        {/* Report Download */}
        {isReport && article.downloadUrl && (
          <div className="mb-8 sm:mb-10 p-5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-4">
            <Download className="h-8 w-8 text-blue-500 shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground mb-1">下载完整报告</h4>
              <p className="text-xs text-muted-foreground">获取 PDF 格式的完整报告，包含详细数据和图表。</p>
            </div>
            <button onClick={() => toast.info("报告下载功能即将上线")} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 active:scale-95 transition-all shrink-0">下载 PDF</button>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center gap-2 py-4 border-y border-border/40 mb-8 sm:mb-10">
          <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all active:scale-95 ${liked ? "bg-red-50 text-red-500" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} /><span className="text-xs">{(article.likeCount || 0) + (liked ? 1 : 0)}</span>
          </button>
          <button onClick={handleBookmark} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all active:scale-95 ${bookmarked ? "bg-amber-50 text-amber-500" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} /><span className="text-xs">收藏</span>
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-secondary/50 text-muted-foreground hover:bg-secondary transition-all active:scale-95">
            <Share2 className="h-4 w-4" /><span className="text-xs">分享</span>
          </button>
          <span className="ml-auto text-xs text-muted-foreground/40 flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{article.commentCount || 0} 条评论</span>
        </div>

        {/* Comment Section */}
        <div className="mb-10 sm:mb-12">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">评论区</h3>
          <div className="flex items-start gap-3 mb-6">
            <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">U</div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="分享你的想法..."
                className="w-full h-20 px-4 py-3 rounded-xl bg-secondary/30 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] text-muted-foreground/40">评论需审核后显示</p>
                <button onClick={handleComment} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 active:scale-95 transition-all">
                  <Send className="h-3 w-3" />发表评论
                </button>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-secondary/20 border border-border/30 text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground/50">暂无评论，来发表第一条吧</p>
          </div>
        </div>
      </motion.article>

      {/* Related Articles */}
      {related.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="pb-8 sm:pb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">智能推荐</h3>
            {cat && <Link href={cat.path}><span className="text-xs text-primary flex items-center gap-0.5 hover:text-primary/80 transition-colors">更多{cat.label}<ChevronRight className="h-3 w-3" /></span></Link>}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map((r) => {
              const rCat = getCategoryByKey(r.categoryKey);
              return (
                <Link key={r.id} href={`/site/article/${r.id}`}>
                  <div className="group flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-sm transition-all duration-300 cursor-pointer active:scale-[0.99]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {rCat && <span className="text-[10px] font-medium text-primary/60">{rCat.label}</span>}
                        {r.mediaType === "video" && <Play className="h-2.5 w-2.5 text-red-400" />}
                        {r.mediaType === "podcast" && <Headphones className="h-2.5 w-2.5 text-purple-400" />}
                      </div>
                      <h4 className="text-[14px] sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-1">{r.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-muted-foreground/50">
                        <span>{r.date}</span>
                        <span>{r.readTime}</span>
                        {r.viewCount && <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{formatCount(r.viewCount)}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.section>
      )}
    </div>
  );
}
