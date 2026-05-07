import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  ArrowLeft, Clock, User, Tag, Share2, Eye, MessageCircle,
  Bookmark, Heart, Send, ChevronRight, Loader2,
} from "lucide-react";
import { getCategoryIcon } from "@/components/SiteLayout";
import { getCategoryByKey, formatCount } from "@shared/siteConfig";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

export default function SiteArticleDetail() {
  const params = useParams<{ id: string }>();
  const articleId = parseInt(params.id || "0", 10);
  const { data: article, isLoading, error } = trpc.website.getById.useQuery(
    { id: articleId },
    { enabled: articleId > 0 }
  );
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState("");

  // 获取同板块推荐文章
  const { data: relatedPosts } = trpc.website.published.useQuery(
    { category: article?.category || "", limit: 5 },
    { enabled: !!article?.category }
  );
  const related = useMemo(() => {
    if (!relatedPosts || !article) return [];
    return relatedPosts.filter((p: any) => p.id !== article.id).slice(0, 4);
  }, [relatedPosts, article]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (!article || error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">文章不存在或已被移除</p>
        <Link href="/site"><span className="text-primary hover:underline text-sm">返回首页</span></Link>
      </div>
    );
  }

  const cat = getCategoryByKey(article.category || "");
  const Icon = cat ? getCategoryIcon(cat.iconName) : null;
  const tags: string[] = Array.isArray(article.tags) ? article.tags : [];
  const readMinutes = article.body ? Math.max(2, Math.ceil(article.body.length / 500)) : 3;
  const dateStr = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
    : new Date(article.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });

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
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          {cat && (
            <Link href={cat.path}>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/6 text-primary text-xs font-medium">
                {Icon && <Icon className="h-3 w-3" />}{cat.label}
              </span>
            </Link>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-[32px] font-bold text-foreground tracking-tight leading-[1.3] sm:leading-snug mb-4 sm:mb-5">{article.title}</h1>

        {/* Meta */}
        <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-[13px] sm:text-sm text-muted-foreground/60 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-border/40">
          <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />深象OPCS研究院</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{readMinutes} 分钟</span>
          <span>{dateStr}</span>
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-5 rounded-xl bg-primary/4 border border-primary/10">
            <p className="text-[14px] sm:text-[15px] text-foreground/80 leading-relaxed italic">{article.excerpt}</p>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-6 sm:mb-8">
            <Tag className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            {tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-md bg-secondary text-xs font-medium text-secondary-foreground">{t}</span>
            ))}
          </div>
        )}

        {/* Article Body - Markdown Rendering */}
        <div className="mb-8 sm:mb-10">
          {article.body ? (
            <div className="prose prose-sm sm:prose-base prose-slate dark:prose-invert max-w-none
              prose-headings:text-foreground prose-headings:font-bold
              prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4
              prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/30
              prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2
              prose-p:text-foreground/80 prose-p:leading-[1.8]
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-blockquote:border-primary/30 prose-blockquote:bg-primary/4 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4
              prose-code:text-primary prose-code:bg-primary/6 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
              prose-table:border-collapse prose-table:w-full
              prose-th:bg-secondary/60 prose-th:text-foreground prose-th:font-semibold prose-th:text-sm prose-th:px-4 prose-th:py-2.5 prose-th:border prose-th:border-border/50
              prose-td:text-foreground/80 prose-td:text-sm prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-border/30
              prose-tr:even:bg-secondary/20
              prose-li:text-foreground/80 prose-li:leading-relaxed
              prose-hr:border-border/30
              prose-img:rounded-xl prose-img:shadow-md
            ">
              <Streamdown>{article.body}</Streamdown>
            </div>
          ) : (
            <div className="p-5 sm:p-6 rounded-xl bg-secondary/50 border border-border/30 text-center">
              <p className="text-muted-foreground text-sm">完整内容正在准备中。</p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2 py-4 border-y border-border/40 mb-8 sm:mb-10">
          <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all active:scale-95 ${liked ? "bg-red-50 text-red-500" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} /><span className="text-xs">{liked ? 1 : 0}</span>
          </button>
          <button onClick={handleBookmark} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all active:scale-95 ${bookmarked ? "bg-amber-50 text-amber-500" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} /><span className="text-xs">收藏</span>
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-secondary/50 text-muted-foreground hover:bg-secondary transition-all active:scale-95">
            <Share2 className="h-4 w-4" /><span className="text-xs">分享</span>
          </button>
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
            <h3 className="text-base sm:text-lg font-semibold text-foreground">相关推荐</h3>
            {cat && <Link href={cat.path}><span className="text-xs text-primary flex items-center gap-0.5 hover:text-primary/80 transition-colors">更多{cat.label}<ChevronRight className="h-3 w-3" /></span></Link>}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map((r: any) => {
              const rCat = getCategoryByKey(r.category || "");
              const rDate = r.publishedAt
                ? new Date(r.publishedAt).toLocaleDateString("zh-CN")
                : new Date(r.createdAt).toLocaleDateString("zh-CN");
              const rReadTime = r.body ? `${Math.max(2, Math.ceil(r.body.length / 500))} 分钟` : "3 分钟";
              return (
                <Link key={r.id} href={`/site/article/${r.id}`}>
                  <div className="group flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-sm transition-all duration-300 cursor-pointer active:scale-[0.99]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {rCat && <span className="text-[10px] font-medium text-primary/60">{rCat.label}</span>}
                      </div>
                      <h4 className="text-[14px] sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-1">{r.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-muted-foreground/50">
                        <span>{rDate}</span>
                        <span>{rReadTime}</span>
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
