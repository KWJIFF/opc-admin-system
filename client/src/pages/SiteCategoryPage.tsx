import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Clock, User, Tag, Play, Headphones, Eye, ThumbsUp,
  Download, MessageCircle,
} from "lucide-react";
import { getCategoryIcon } from "@/components/SiteLayout";
import {
  getCategoryByKey, getArticlesByCategory, formatDuration, formatCount,
  type SiteArticle,
} from "@shared/siteConfig";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

/* ── 通用文章卡片 ── */
function ArticleCard({ article, index }: { article: SiteArticle; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + index * 0.04 }}>
      <Link href={`/site/article/${article.id}`}>
        <div className="group flex items-start gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.99]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {article.mediaType === "video" && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-medium"><Play className="h-2.5 w-2.5" />视频</span>}
              {article.mediaType === "podcast" && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-medium"><Headphones className="h-2.5 w-2.5" />播客</span>}
              {article.mediaType === "report" && article.downloadUrl && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-medium"><Download className="h-2.5 w-2.5" />可下载</span>}
            </div>
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
                  {article.tags.map((t) => (
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

/* ── 视频卡片 ── */
function VideoCard({ article, index }: { article: SiteArticle; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}>
      <Link href={`/site/article/${article.id}`}>
        <div className="group rounded-xl bg-card border border-border/40 overflow-hidden hover:border-red-200 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.99]">
          <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="h-6 w-6 text-red-500 ml-0.5" />
            </div>
            {article.duration && <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-medium">{formatDuration(article.duration)}</span>}
          </div>
          <div className="p-4">
            <h4 className="text-[14px] font-medium text-foreground group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-2">{article.title}</h4>
            <p className="text-[12px] text-muted-foreground line-clamp-2 mb-3">{article.summary}</p>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
              <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{formatCount(article.viewCount || 0)}</span>
              <span className="flex items-center gap-0.5"><ThumbsUp className="h-2.5 w-2.5" />{formatCount(article.likeCount || 0)}</span>
              <span>{article.date}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── 播客卡片 ── */
function PodcastCard({ article, index }: { article: SiteArticle; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}>
      <Link href={`/site/article/${article.id}`}>
        <div className="group flex items-center gap-4 p-4 sm:p-5 rounded-xl bg-card border border-border/40 hover:border-purple-200 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.99]">
          <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
            <Headphones className="h-7 w-7 sm:h-8 sm:w-8 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[14px] sm:text-[15px] font-medium text-foreground group-hover:text-purple-600 transition-colors line-clamp-2 leading-snug mb-1.5">{article.title}</h4>
            <p className="text-[12px] sm:text-[13px] text-muted-foreground line-clamp-2 mb-2">{article.summary}</p>
            <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-muted-foreground/50">
              {article.duration && <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{formatDuration(article.duration)}</span>}
              <span>{article.date}</span>
              <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{formatCount(article.viewCount || 0)}</span>
              <span className="flex items-center gap-0.5"><ThumbsUp className="h-2.5 w-2.5" />{formatCount(article.likeCount || 0)}</span>
            </div>
          </div>
          <Play className="h-10 w-10 p-2 rounded-full bg-purple-50 text-purple-500 shrink-0 group-hover:bg-purple-100 transition-colors" />
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

/* ── 板块页面（通过 categoryKey prop 驱动） ── */
export default function SiteCategoryPage({ categoryKey }: { categoryKey: string }) {
  const cat = getCategoryByKey(categoryKey);
  if (!cat) return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">板块不存在</div>;

  const Icon = getCategoryIcon(cat.iconName);
  const articles = getArticlesByCategory(categoryKey);
  const featured = articles.find((a) => a.featured) || articles[0];
  const rest = articles.filter((a) => a.id !== featured?.id);

  const isVideoCategory = categoryKey === "videos";
  const isPodcastCategory = categoryKey === "podcasts";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Header */}
      <motion.div {...fadeUp} className="pt-2 sm:pt-4 pb-8 sm:pb-10 lg:pb-14">
        <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
          <div className={`p-2 sm:p-2.5 rounded-xl ${isVideoCategory ? "bg-red-50 text-red-500" : isPodcastCategory ? "bg-purple-50 text-purple-500" : "bg-primary/6 text-primary"}`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest block ${isVideoCategory ? "text-red-400" : isPodcastCategory ? "text-purple-400" : "text-primary/60"}`}>{cat.tag}</span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">{cat.label}</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">{cat.desc}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground/50">
          <span>{articles.length} 篇内容</span>
          <span>总浏览 {formatCount(articles.reduce((s, a) => s + (a.viewCount || 0), 0))}</span>
        </div>
      </motion.div>

      {/* Video Grid Layout */}
      {isVideoCategory && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8 sm:pb-12">
          {articles.map((article, i) => (
            <VideoCard key={article.id} article={article} index={i} />
          ))}
        </div>
      )}

      {/* Podcast List Layout */}
      {isPodcastCategory && (
        <div className="space-y-3 pb-8 sm:pb-12">
          {articles.map((article, i) => (
            <PodcastCard key={article.id} article={article} index={i} />
          ))}
        </div>
      )}

      {/* Default Article Layout */}
      {!isVideoCategory && !isPodcastCategory && (
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
