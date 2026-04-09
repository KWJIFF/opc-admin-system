import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Clock, User, Tag } from "lucide-react";
import { getCategoryIcon } from "@/components/SiteLayout";
import {
  getCategoryByKey,
  getArticlesByCategory,
  type SiteCategory,
  type SiteArticle,
} from "@shared/siteConfig";

/* ── 文章卡片（可独立复用） ── */
function ArticleCard({ article, index }: { article: SiteArticle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.04 }}
    >
      <Link href={`/site/article/${article.id}`}>
        <div className="group flex items-start gap-4 p-4 sm:p-5 rounded-xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
              {article.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {article.summary}
            </p>
            <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground/50">
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
              <span>{article.date}</span>
              {article.tags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3 w-3" />
                  {article.tags.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-medium text-secondary-foreground">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary/50 transition-all shrink-0 mt-1 group-hover:translate-x-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}

/* ── 精选文章卡片 ── */
function FeaturedCard({ article }: { article: SiteArticle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 }}
      className="mb-8"
    >
      <Link href={`/site/article/${article.id}`}>
        <div className="group relative p-6 sm:p-8 rounded-2xl bg-card border border-border/50 card-elevated cursor-pointer">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/50 mb-3 block">精选</span>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-3 leading-snug max-w-3xl">
            {article.title}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl mb-5 line-clamp-3">
            {article.summary}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
            <span>{article.date}</span>
          </div>
          <ArrowRight className="absolute top-6 right-6 h-5 w-5 text-muted-foreground/20 group-hover:text-primary/50 transition-all group-hover:translate-x-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}

/* ── 板块页面（通过 categoryKey prop 或路由参数驱动） ── */
export default function SiteCategoryPage({ categoryKey }: { categoryKey: string }) {
  const cat = getCategoryByKey(categoryKey);
  if (!cat) return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">板块不存在</div>;

  const Icon = getCategoryIcon(cat.iconName);
  const articles = getArticlesByCategory(categoryKey);
  const featured = articles.find((a) => a.featured) || articles[0];
  const rest = articles.filter((a) => a.id !== featured?.id);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-4 pb-10 sm:pb-14"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-primary/6 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary/60 block">{cat.tag}</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{cat.label}</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">{cat.desc}</p>
      </motion.div>

      {/* Featured */}
      {featured && <FeaturedCard article={featured} />}

      {/* List */}
      <div className="space-y-3 pb-12">
        {rest.map((article, i) => (
          <ArticleCard key={article.id} article={article} index={i} />
        ))}
      </div>
    </div>
  );
}
