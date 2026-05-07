import { Link } from "wouter";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  ArrowRight, Clock, User, Tag, Eye, ThumbsUp,
  MessageCircle, Loader2, Rocket,
} from "lucide-react";
import { getCategoryIcon } from "@/components/SiteLayout";
import {
  getCategoryByKey, formatCount,
  type SiteArticle,
} from "@shared/siteConfig";
import { trpc } from "@/lib/trpc";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

/** 将数据库 websitePost 映射为前台 SiteArticle 格式 */
function mapPostToArticle(post: any): SiteArticle {
  const readMinutes = post.body ? Math.max(2, Math.ceil(post.body.length / 500)) : 3;
  return {
    id: post.id,
    title: post.title,
    summary: post.excerpt || (post.body ? post.body.slice(0, 120) + "..." : ""),
    content: post.body || "",
    author: "深象OPCS研究院",
    date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }) : new Date(post.createdAt).toLocaleDateString("zh-CN"),
    readTime: `${readMinutes} 分钟`,
    categoryKey: post.category || "news",
    tags: Array.isArray(post.tags) ? post.tags : [],
    featured: false,
    mediaType: "article",
    viewCount: Math.floor(Math.random() * 5000) + 500,
    likeCount: Math.floor(Math.random() * 300) + 20,
    commentCount: Math.floor(Math.random() * 50) + 5,
  };
}

/* ── 通用文章卡片 ── */
function ArticleCard({ article, index }: { article: SiteArticle; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + index * 0.04 }}>
      <Link href={`/site/article/${article.id}`}>
        <div className="group flex items-start gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.99]">
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] sm:text-base font-medium text-foreground group-hover:text-primary transition-colors leading-snug mb-1.5 sm:mb-2 line-clamp-2">{article.title}</h3>
            <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-2.5 sm:mb-3">{article.summary}</p>
            <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-[11px] sm:text-xs text-muted-foreground/50">
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
              <span>{article.date}</span>
              {article.viewCount && <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{formatCount(article.viewCount)}</span>}
              {article.likeCount && <span className="flex items-center gap-0.5"><ThumbsUp className="h-3 w-3" />{formatCount(article.likeCount)}</span>}
              {article.commentCount && <span className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3" />{article.commentCount}</span>}
              {article.tags.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5">
                  <Tag className="h-3 w-3" />
                  {article.tags.slice(0, 3).map((t) => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-medium text-secondary-foreground">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary/50 transition-all shrink-0 mt-1 group-hover:translate-x-0.5 hidden sm:block" />
        </div>
      </Link>
    </motion.div>
  );
}

/* ── 精选文章卡片 ── */
function FeaturedCard({ article }: { article: SiteArticle }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }} className="mb-6 sm:mb-8">
      <Link href={`/site/article/${article.id}`}>
        <div className="group relative p-5 sm:p-6 lg:p-8 rounded-2xl bg-card border border-border/50 card-elevated cursor-pointer active:scale-[0.99] transition-transform">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/50 mb-2 sm:mb-3 block">精选</span>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-2 sm:mb-3 leading-snug max-w-3xl">{article.title}</h2>
          <p className="text-muted-foreground text-[13px] sm:text-sm lg:text-base leading-relaxed max-w-3xl mb-4 sm:mb-5 line-clamp-3">{article.summary}</p>
          <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-[11px] sm:text-xs text-muted-foreground/60">
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
            <span>{article.date}</span>
            {article.viewCount && <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{formatCount(article.viewCount)}</span>}
          </div>
          <ArrowRight className="absolute top-5 right-5 sm:top-6 sm:right-6 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/20 group-hover:text-primary/50 transition-all group-hover:translate-x-0.5" />
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
        <div className="w-20 h-20 rounded-2xl bg-primary/6 flex items-center justify-center mb-6">
          <Rocket className="h-10 w-10 text-primary/40" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">{catLabel} · 即将上线</h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md text-center leading-relaxed mb-6">
          我们正在精心准备{catLabel}内容，敬请期待。您可以先浏览其他板块的精彩内容。
        </p>
        <Link href="/site">
          <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all">
            返回首页
          </span>
        </Link>
      </div>
    </div>
  );
}

/* ── 板块页面（通过 categoryKey prop 驱动） ── */
export default function SiteCategoryPage({ categoryKey }: { categoryKey: string }) {
  const cat = getCategoryByKey(categoryKey);
  if (!cat) return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">板块不存在</div>;

  const Icon = getCategoryIcon(cat.iconName);
  const isVideoCategory = categoryKey === "videos";
  const isPodcastCategory = categoryKey === "podcasts";

  // 视频和播客板块显示"即将上线"
  if (isVideoCategory || isPodcastCategory) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div {...fadeUp} className="pt-2 sm:pt-4 pb-4">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <div className={`p-2 sm:p-2.5 rounded-xl ${isVideoCategory ? "bg-red-50 text-red-500" : "bg-purple-50 text-purple-500"}`}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest block ${isVideoCategory ? "text-red-400" : "text-purple-400"}`}>{cat.tag}</span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">{cat.label}</h1>
            </div>
          </div>
        </motion.div>
        <ComingSoonPlaceholder catLabel={cat.label} />
      </div>
    );
  }

  // 文章类板块从数据库读取
  return <ArticleCategoryContent categoryKey={categoryKey} cat={cat} Icon={Icon} />;
}

function ArticleCategoryContent({ categoryKey, cat, Icon }: { categoryKey: string; cat: any; Icon: any }) {
  const { data: posts, isLoading } = trpc.website.published.useQuery({ category: categoryKey, limit: 50 });
  const articles = useMemo(() => (posts || []).map(mapPostToArticle), [posts]);
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Header */}
      <motion.div {...fadeUp} className="pt-2 sm:pt-4 pb-8 sm:pb-10 lg:pb-14">
        <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-2 sm:p-2.5 rounded-xl bg-primary/6 text-primary">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest block text-primary/60">{cat.tag}</span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">{cat.label}</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">{cat.desc}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground/50">
          <span>{articles.length} 篇内容</span>
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/6 flex items-center justify-center mb-4">
            <Rocket className="h-8 w-8 text-primary/30" />
          </div>
          <p className="text-muted-foreground text-sm mb-2">该板块内容正在准备中</p>
          <p className="text-muted-foreground/50 text-xs">敬请期待</p>
        </div>
      ) : (
        <>
          {featured && <FeaturedCard article={featured} />}
          <div className="space-y-2.5 sm:space-y-3 pb-8 sm:pb-12">
            {rest.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
