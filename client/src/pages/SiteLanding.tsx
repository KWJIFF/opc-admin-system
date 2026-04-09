import { Link } from "wouter";
import { motion } from "framer-motion";
import { getCategoryIcon } from "@/components/SiteLayout";
import { getEnabledCategories, getLatestArticles, getCategoryByKey } from "@shared/siteConfig";
import { ArrowRight, Sparkles } from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695431/Fb26PagKyopspprUoxxADo/logo-icon_48921fa8.webp";

const categories = getEnabledCategories();
const latestArticles = getLatestArticles(6);

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const } },
};

export default function SiteLanding() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* ── Hero ── */}
      <section className="pt-6 sm:pt-12 lg:pt-20 pb-10 sm:pb-16 lg:pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-primary/6 border border-primary/10 mb-6 sm:mb-8">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
            <span className="text-[11px] sm:text-xs font-medium text-primary">一人公司创业者的内容运营服务平台</span>
          </div>

          <h1 className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-6">
            用结构化方法论
            <br />
            <span className="text-primary">驱动内容增长</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-7 sm:mb-10 px-2 sm:px-0">
            深象科技专注于一人公司领域的深度研究与内容服务。我们追踪全球创业先行者的思想脉络，拆解可复制的增长策略，为独立创业者提供系统化的认知升级路径。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
            <Link href="/site/news">
              <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium text-sm btn-press hover:bg-primary/90 transition-colors shadow-sm">
                开始阅读
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/site/about">
              <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary text-foreground font-medium text-sm btn-press hover:bg-secondary/80 transition-colors">
                了解深象科技
              </span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── 内容板块导航 ── */}
      <section className="pb-14 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">内容矩阵</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto px-2 sm:px-0">
            从快讯到深度研究，从思想启发到实战落地，构建完整的认知与行动闭环。
          </p>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.iconName);
            return (
              <motion.div key={cat.key} variants={fadeUp}>
                <Link href={cat.path}>
                  <div className="group relative p-5 sm:p-6 rounded-2xl bg-card border border-border/50 card-elevated cursor-pointer h-full active:scale-[0.98] transition-transform">
                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-primary/70 mb-2 sm:mb-3 block">{cat.tag}</span>
                    <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-3">
                      <div className="p-2 rounded-xl bg-primary/6 text-primary">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{cat.label}</h3>
                    </div>
                    <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
                    <ArrowRight className="absolute top-5 right-5 sm:top-6 sm:right-6 h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-all group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── 最新内容 ── */}
      <section className="pb-14 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">最新内容</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">来自各板块的最新发布</p>
            </div>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {latestArticles.map((article, i) => {
              const cat = getCategoryByKey(article.categoryKey);
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link href={`/site/article/${article.id}`}>
                    <div className="group flex items-start gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.99]">
                      <span className="text-2xl sm:text-3xl font-bold text-muted-foreground/15 leading-none shrink-0 w-6 sm:w-8 text-right tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/60">{cat?.tag}</span>
                          <span className="text-[10px] text-muted-foreground/40">·</span>
                          <span className="text-[10px] text-muted-foreground/50">{article.date}</span>
                        </div>
                        <h3 className="text-[15px] sm:text-base font-medium text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {article.title}
                        </h3>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary/50 transition-all shrink-0 mt-0.5 sm:mt-1 group-hover:translate-x-0.5 hidden sm:block" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-8 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center"
          style={{
            background: "linear-gradient(135deg, oklch(0.705 0.191 47.604 / 0.06) 0%, oklch(0.705 0.191 47.604 / 0.02) 100%)",
            border: "1px solid oklch(0.705 0.191 47.604 / 0.1)",
          }}
        >
          <img src={LOGO_URL} alt="" className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl mx-auto mb-4 sm:mb-5 opacity-80" />
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">
            加入深象，一起探索一人公司的无限可能
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto mb-6 sm:mb-8 px-2 sm:px-0">
            无论你是正在探索独立创业的新手，还是已经在路上的 Solopreneur，这里都有适合你的内容和工具。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
            <Link href="/site/news">
              <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium text-sm btn-press hover:bg-primary/90 transition-colors shadow-sm">
                浏览最新内容
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/site/toolkit">
              <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium text-sm btn-press hover:bg-accent transition-colors">
                探索工具图谱
              </span>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
