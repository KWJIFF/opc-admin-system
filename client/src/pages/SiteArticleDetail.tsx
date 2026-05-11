import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { useState, useMemo, useRef, useEffect } from "react";
import { useMermaidRenderer } from "@/components/MermaidRenderer";
import {
  ArrowLeft, Clock, User, Tag, Share2, Eye, MessageCircle,
  Bookmark, Heart, Send, ChevronRight, Loader2, BookOpen,
} from "lucide-react";
import { getCategoryIcon } from "@/components/SiteLayout";
import { getCategoryByKey, formatCount } from "@shared/siteConfig";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        <p className="text-sm text-muted-foreground/40">加载中...</p>
      </div>
    );
  }

  if (!article || error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground/15 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">文章不存在</h2>
        <p className="text-muted-foreground text-sm mb-6">该文章可能已被移除或链接无效</p>
        <Link href="/site">
          <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all btn-press">
            <ArrowLeft className="h-4 w-4" />返回首页
          </span>
        </Link>
      </div>
    );
  }

  const cat = getCategoryByKey(article.category || "");
  const Icon = cat ? getCategoryIcon(cat.iconName) : null;
  const tags: string[] = Array.isArray(article.tags) ? article.tags : [];
  const readMinutes = article.body ? Math.max(2, Math.ceil(article.body.length / 500)) : 3;
  const chartCount = (article.body || "").match(/```mermaid/g)?.length || 0;
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
      {/* 面包屑导航 */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-2 sm:pt-4 pb-6 sm:pb-8"
      >
        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground/50">
          <Link href="/site"><span className="hover:text-foreground transition-colors cursor-pointer">首页</span></Link>
          <ChevronRight className="h-3 w-3" />
          {cat && (
            <>
              <Link href={cat.path}><span className="hover:text-foreground transition-colors cursor-pointer">{cat.label}</span></Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-foreground/60 truncate max-w-[200px]">{article.title}</span>
        </div>
      </motion.div>

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 文章头部 — 杂志级排版 */}
        <header className="mb-8 sm:mb-10">
          {/* 分类标签 */}
          <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
            {cat && (
              <Link href={cat.path}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/6 text-primary text-xs font-medium border border-primary/8 hover:bg-primary/10 transition-colors">
                  {Icon && <Icon className="h-3 w-3" />}{cat.label}
                </span>
              </Link>
            )}
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="tag-pill">{t}</span>
            ))}
          </div>

          {/* 标题 — 衬线字体 */}
          <h1 className="heading-serif text-[24px] sm:text-[28px] lg:text-[36px] text-foreground leading-[1.25] sm:leading-[1.2] mb-5 sm:mb-6 max-w-3xl">
            {article.title}
          </h1>

          {/* 元信息 */}
          <div className="flex items-center flex-wrap gap-4 text-[13px] text-muted-foreground/55 pb-6 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-primary text-xs font-bold ring-1 ring-primary/10">深</div>
              <div>
                <p className="text-xs font-medium text-foreground/70">深象OPCS研究院</p>
                <p className="text-[11px] text-muted-foreground/40">{dateStr}</p>
              </div>
            </div>
            <span className="w-px h-4 bg-border/40" />
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{readMinutes} 分钟阅读</span>
            {chartCount > 0 && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 text-[11px] font-medium">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                {chartCount} 张可视化图表
              </span>
            )}
            <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />深度文章</span>
          </div>
        </header>

        {/* 摘要 — 精致引用样式 */}
        {article.excerpt && (
          <div className="mb-8 sm:mb-10 relative">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-primary/50 to-primary/10" />
            <div className="pl-6 py-1">
              <p className="text-[15px] sm:text-base text-foreground/70 leading-[1.8] italic font-light">
                {article.excerpt}
              </p>
            </div>
          </div>
        )}

        {/* 文章正文 — 使用 article-body 杂志级排版 + Mermaid 图表 */}
        <div className="mb-10 sm:mb-12">
          {article.body ? (
            <ArticleBody content={article.body} />
          ) : (
            <div className="p-8 rounded-2xl bg-secondary/30 border border-border/30 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/15 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">完整内容正在准备中，敬请期待。</p>
            </div>
          )}
        </div>

        {/* 标签云 */}
        {tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-8 pb-8 border-b border-border/30">
            <Tag className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
            {tags.map((t) => (
              <span key={t} className="tag-pill">{t}</span>
            ))}
          </div>
        )}

        {/* 互动栏 — 精致浮动样式 */}
        <div className="flex items-center gap-2.5 py-5 border-y border-border/30 mb-10 sm:mb-12">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              liked
                ? "bg-red-50 text-red-500 border border-red-100 shadow-sm shadow-red-100/50"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent"
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            <span className="text-xs">{liked ? "已赞" : "点赞"}</span>
          </button>
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              bookmarked
                ? "bg-amber-50 text-amber-600 border border-amber-100 shadow-sm shadow-amber-100/50"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
            <span className="text-xs">{bookmarked ? "已收藏" : "收藏"}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-secondary/50 text-muted-foreground hover:bg-secondary transition-all active:scale-95 border border-transparent"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs">分享</span>
          </button>
        </div>

        {/* 评论区 — 精致设计 */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-1 h-5 rounded-full bg-primary" />
            <h3 className="text-base sm:text-lg font-bold text-foreground">评论区</h3>
          </div>

          <div className="flex items-start gap-3 mb-6">
            <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-primary text-sm font-bold ring-1 ring-primary/10">
              U
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="分享你的想法..."
                className="w-full h-24 px-4 py-3 rounded-xl bg-card border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/25 transition-all resize-none"
              />
              <div className="flex items-center justify-between mt-2.5">
                <p className="text-[11px] text-muted-foreground/35">评论需审核后显示</p>
                <button
                  onClick={handleComment}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/15 btn-press"
                >
                  <Send className="h-3 w-3" />发表评论
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-secondary/20 border border-border/20 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/12 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground/40 mb-1">暂无评论</p>
            <p className="text-[11px] text-muted-foreground/25">来发表第一条评论吧</p>
          </div>
        </div>
      </motion.article>

      {/* 相关推荐 — 精致卡片 */}
      {related.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="pb-10 sm:pb-14"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 rounded-full bg-orange-400" />
              <h3 className="text-base sm:text-lg font-bold text-foreground">相关推荐</h3>
            </div>
            {cat && (
              <Link href={cat.path}>
                <span className="text-xs text-primary flex items-center gap-0.5 hover:text-primary/80 transition-colors font-medium">
                  更多{cat.label}<ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map((r: any) => {
              const rCat = getCategoryByKey(r.category || "");
              const RIcon = rCat ? getCategoryIcon(rCat.iconName) : null;
              const rDate = r.publishedAt
                ? new Date(r.publishedAt).toLocaleDateString("zh-CN")
                : new Date(r.createdAt).toLocaleDateString("zh-CN");
              const rReadTime = r.body ? `${Math.max(2, Math.ceil(r.body.length / 500))} 分钟` : "3 分钟";
              return (
                <Link key={r.id} href={`/site/article/${r.id}`}>
                  <div className="group p-4 sm:p-5 rounded-xl bg-card border border-border/30 hover:border-primary/15 hover:shadow-lg hover:shadow-primary/[0.03] transition-all duration-350 cursor-pointer active:scale-[0.995]">
                    <div className="flex items-center gap-2 mb-2.5">
                      {rCat && RIcon && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] font-medium border border-primary/8">
                          <RIcon className="h-2.5 w-2.5" />{rCat.label}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground/35">{rDate}</span>
                    </div>
                    <h4 className="text-[14px] sm:text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-2">
                      {r.title}
                    </h4>
                    {r.excerpt && (
                      <p className="text-[12px] text-muted-foreground/55 line-clamp-2 leading-relaxed mb-2">{r.excerpt}</p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40">
                      <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{rReadTime}</span>
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

/** 文章正文渲染组件，支持 Mermaid 图表 */
function ArticleBody({ content }: { content: string }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const { reset } = useMermaidRenderer(bodyRef);

  useEffect(() => {
    // 当内容变化时重置 mermaid 渲染状态
    reset();
  }, [content]);

  return (
    <div className="article-body" ref={bodyRef}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
