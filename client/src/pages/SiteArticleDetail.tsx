import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, Tag, Share2 } from "lucide-react";
import { getCategoryIcon } from "@/components/SiteLayout";
import { getArticleById, getCategoryByKey, getArticlesByCategory } from "@shared/siteConfig";
import { toast } from "sonner";

export default function SiteArticleDetail() {
  const params = useParams<{ id: string }>();
  const articleId = parseInt(params.id || "0", 10);
  const article = getArticleById(articleId);

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">文章不存在或已被移除</p>
        <Link href="/site">
          <span className="text-primary hover:underline text-sm">返回首页</span>
        </Link>
      </div>
    );
  }

  const cat = getCategoryByKey(article.categoryKey);
  const Icon = cat ? getCategoryIcon(cat.iconName) : null;
  const related = getArticlesByCategory(article.categoryKey)
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("链接已复制到剪贴板");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      {/* Back */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-1 sm:pt-2 pb-4 sm:pb-6"
      >
        <Link href={cat?.path || "/site"}>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95 py-1">
            <ArrowLeft className="h-4 w-4" />
            返回{cat?.label || "首页"}
          </span>
        </Link>
      </motion.div>

      {/* Article Header */}
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Category badge */}
        {cat && (
          <Link href={cat.path}>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/6 text-primary text-xs font-medium mb-3 sm:mb-4">
              {Icon && <Icon className="h-3 w-3" />}
              {cat.label}
            </span>
          </Link>
        )}

        <h1 className="text-xl sm:text-2xl lg:text-[32px] font-bold text-foreground tracking-tight leading-[1.3] sm:leading-snug mb-4 sm:mb-5">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-[13px] sm:text-sm text-muted-foreground/60 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-border/40">
          <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{article.author}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{article.readTime}</span>
          <span>{article.date}</span>
          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-1.5 text-muted-foreground/40 hover:text-primary transition-colors active:scale-95 py-1 px-2 -mr-2 rounded-lg"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="text-xs">分享</span>
          </button>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-6 sm:mb-8">
            <Tag className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            {article.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-md bg-secondary text-xs font-medium text-secondary-foreground">{t}</span>
            ))}
          </div>
        )}

        {/* Content (summary as placeholder) */}
        <div className="mb-10 sm:mb-12">
          <p className="text-[15px] sm:text-base leading-[1.8] sm:leading-relaxed text-foreground/80 mb-6">{article.summary}</p>
          <div className="p-5 sm:p-6 rounded-xl bg-secondary/50 border border-border/30 text-center">
            <p className="text-muted-foreground text-sm">完整文章内容将通过后台内容管理系统发布后展示。</p>
            <p className="text-muted-foreground/50 text-xs mt-2">当前为预览模式</p>
          </div>
        </div>
      </motion.article>

      {/* Related Articles */}
      {related.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="pb-8 sm:pb-12"
        >
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">相关阅读</h3>
          <div className="space-y-2.5 sm:space-y-3">
            {related.map((r) => (
              <Link key={r.id} href={`/site/article/${r.id}`}>
                <div className="group flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-sm transition-all duration-300 cursor-pointer active:scale-[0.99]">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-1">
                      {r.title}
                    </h4>
                    <span className="text-[11px] sm:text-xs text-muted-foreground/50">{r.date} · {r.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
