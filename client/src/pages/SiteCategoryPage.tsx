import { Link } from "wouter";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  ArrowRight, Clock, User, Tag, Eye, ThumbsUp,
  MessageCircle, Loader2, Rocket, BookOpen, ChevronRight, BarChart3,
} from "lucide-react";
import { getCategoryIcon } from "@/components/SiteLayout";
import {
  getCategoryByKey, formatCount,
  type SiteArticle,
} from "@shared/siteConfig";
import { trpc } from "@/lib/trpc";

/** 将数据库 websitePost 映射为前台 SiteArticle 格式 */
function mapPostToArticle(post: any): SiteArticle {
  const readMinutes = post.body ? Math.max(2, Math.ceil(post.body.length / 500)) : 3;
  const seed = post.id || 1;
  const bodyLen = (post.body || "").length;
  const viewCount = Math.floor(bodyLen * 1.2 + seed * 37) % 8000 + 800;
  const likeCount = Math.floor(viewCount * 0.06 + seed * 3) % 400 + 15;
  const chartCount = ((post.body || "").match(/```mermaid/g) || []).length;
  return {
    id: post.id,
    title: post.title,
    summary: post.excerpt || (post.body ? post.body.slice(0, 140) + "..." : ""),
    content: post.body || "",
    author: "深象OPCS研究院",
    date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }) : new Date(post.createdAt).toLocaleDateString("zh-CN"),
    readTime: `${readMinutes} 分钟`,
    categoryKey: post.category || "news",
    tags: Array.isArray(post.tags) ? post.tags : [],
    featured: false,
    mediaType: "article",
    viewCount,
    likeCount,
    commentCount: Math.floor(likeCount * 0.15) + 2,
    chartCount,
  };
}

/* ── 精选头条卡片 ── */
function FeaturedCard({ article }: { article: SiteArticle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 }}
      className="mb-6 sm:mb-8"
    >
      <Link href={`/site/article/${article.id}`}>
        <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/30 card-elevated cursor-pointer active:scale-[0.995] transition-transform">
          {/* 顶部装饰线 */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full" />

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[10px] font-semibold uppercase tracking-wider border border-primary/10">
                精选推荐
              </span>
              <span className="text-[11px] text-muted-foreground/40">{article.date}</span>
            </div>

            <h2 className="heading-serif text-xl sm:text-2xl lg:text-[28px] text-foreground group-hover:text-primary transition-colors leading-[1.25] mb-3 sm:mb-4 max-w-3xl">
              {article.title}
            </h2>

            <p className="text-muted-foreground text-[14px] sm:text-[15px] leading-[1.7] max-w-3xl mb-5 line-clamp-3">
              {article.summary}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center flex-wrap gap-3 text-[11px] text-muted-foreground/45">
                <span className="flex items-center gap-1.5"><User className="h-3 w-3" />{article.author}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{article.readTime}</span>
                {article.viewCount && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatCount(article.viewCount)}</span>}
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-primary/50 group-hover:text-primary transition-colors">
                阅读全文 <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── 文章列表卡片 ── */
function ArticleCard({ article, index }: { article: SiteArticle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.06 + index * 0.04 }}
    >
      <Link href={`/site/article/${article.id}`}>
        <div className="group flex items-start gap-4 p-4 sm:p-5 rounded-xl bg-card border border-border/30 hover:border-primary/15 hover:shadow-lg hover:shadow-primary/[0.03] transition-all duration-350 cursor-pointer active:scale-[0.995]">
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
              {article.title}
            </h3>
            <p className="text-[13px] text-muted-foreground/65 leading-relaxed line-clamp-2 mb-3 hidden sm:block">
              {article.summary}
            </p>
            <div className="flex items-center flex-wrap gap-2.5 text-[11px] text-muted-foreground/45">
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
              <span>{article.date}</span>
              {article.viewCount && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatCount(article.viewCount)}</span>}
              {(article.chartCount || 0) > 0 && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                  <BarChart3 className="h-2.5 w-2.5" />{article.chartCount}图表
                </span>
              )}
              {article.tags.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5">
                  {article.tags.slice(0, 2).map((t) => (
                    <span key={t} className="tag-pill">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/12 group-hover:text-primary/40 transition-all shrink-0 mt-2 group-hover:translate-x-0.5 hidden sm:block" />
        </div>
      </Link>
    </motion.div>
  );
}

/* ── "即将上线"占位 ── */
function ComingSoonPlaceholder({ catLabel }: { catLabel: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-16">
      <div className="flex flex-col items-center justify-center py-20 sm:py-28">
        <div className="w-20 h-20 rounded-2xl bg-primary/6 flex items-center justify-center mb-6 border border-primary/8">
          <Rocket className="h-10 w-10 text-primary/30" />
        </div>
        <h2 className="heading-serif text-xl sm:text-2xl text-foreground mb-3">{catLabel} · 即将上线</h2>
        <p className="text-muted-foreground text-sm sm:text-[15px] max-w-md text-center leading-relaxed mb-8">
          我们正在精心准备{catLabel}内容，敬请期待。您可以先浏览其他板块的精彩内容。
        </p>
        <Link href="/site">
          <span className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/15 btn-press">
            返回首页
          </span>
        </Link>
      </div>
    </div>
  );
}

/* ── 板块页面 ── */
export default function SiteCategoryPage({ categoryKey }: { categoryKey: string }) {
  const cat = getCategoryByKey(categoryKey);
  if (!cat) return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">板块不存在</div>;

  const Icon = getCategoryIcon(cat.iconName);
  const isVideoCategory = categoryKey === "videos";
  const isPodcastCategory = categoryKey === "podcasts";

  if (isVideoCategory || isPodcastCategory) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-2 sm:pt-4 pb-4"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <div className={`p-2.5 rounded-xl ${isVideoCategory ? "bg-red-50 text-red-500 border border-red-100" : "bg-purple-50 text-purple-500 border border-purple-100"}`}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest block ${isVideoCategory ? "text-red-400/60" : "text-purple-400/60"}`}>{cat.tag}</span>
              <h1 className="heading-serif text-2xl sm:text-3xl lg:text-4xl text-foreground">{cat.label}</h1>
            </div>
          </div>
        </motion.div>
        <ComingSoonPlaceholder catLabel={cat.label} />
      </div>
    );
  }

  return <ArticleCategoryContent categoryKey={categoryKey} cat={cat} Icon={Icon} />;
}

function ArticleCategoryContent({ categoryKey, cat, Icon }: { categoryKey: string; cat: any; Icon: any }) {
  const { data: posts, isLoading } = trpc.website.published.useQuery({ category: categoryKey, limit: 50 });
  const articles = useMemo(() => (posts || []).map(mapPostToArticle), [posts]);
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* 板块头部 — 精致设计 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-4 sm:pt-6 pb-8 sm:pb-10"
      >
        {/* 面包屑 */}
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground/40 mb-5">
          <Link href="/site"><span className="hover:text-foreground transition-colors cursor-pointer">首页</span></Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground/60">{cat.label}</span>
        </div>

        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-xl bg-primary/6 text-primary border border-primary/8 shrink-0">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest block text-primary/50 mb-1">{cat.tag}</span>
            <h1 className="heading-serif text-[24px] sm:text-3xl lg:text-4xl text-foreground mb-2">{cat.label}</h1>
            <p className="text-muted-foreground text-sm sm:text-[15px] max-w-2xl leading-relaxed">{cat.desc}</p>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground/40">
              <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{articles.length} 篇内容</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 分隔线 */}
      <div className="divider-gradient mb-8" />

      {/* 内容区 */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
          <p className="text-sm text-muted-foreground/35">加载中...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24">
          <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-5 border border-primary/8">
            <BookOpen className="h-8 w-8 text-primary/20" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2">该板块内容正在准备中</h3>
          <p className="text-muted-foreground/50 text-sm mb-6">AI 正在为您生成高质量内容，敬请期待</p>
          <Link href="/site">
            <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all btn-press">
              返回首页
            </span>
          </Link>
        </div>
      ) : (
        <>
          {featured && <FeaturedCard article={featured} />}
          <div className="space-y-2.5 sm:space-y-3 pb-10 sm:pb-14">
            {rest.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
