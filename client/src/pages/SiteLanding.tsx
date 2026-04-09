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
      <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/6 border border-primary/10 mb-8">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">一人公司创业者的内容运营服务平台</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            用结构化方法论
            <br />
            <span className="text-primary">驱动内容增长</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            深象科技专注于一人公司领域的深度研究与内容服务。我们追踪全球创业先行者的思想脉络，拆解可复制的增长策略，为独立创业者提供系统化的认知升级路径。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/site/news">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium text-sm btn-press hover:bg-primary/90 transition-colors shadow-sm">
                开始阅读
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/site/about">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-foreground font-medium text-sm btn-press hover:bg-secondary/80 transition-colors">
                了解深象科技
              </span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── 内容板块导航 ── */}
      <section className="pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">内容矩阵</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            从快讯到深度研究，从思想启发到实战落地，构建完整的认知与行动闭环。
          </p>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.iconName);
            return (
              <motion.div key={cat.key} variants={fadeUp}>
                <Link href={cat.path}>
                  <div className="group relative p-6 rounded-2xl bg-card border border-border/50 card-elevated cursor-pointer h-full">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-primary/70 mb-3 block">{cat.tag}</span>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-primary/6 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{cat.label}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
                    <ArrowRight className="absolute top-6 right-6 h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-all group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── 最新内容 ── */}
      <section className="pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">最新内容</h2>
              <p className="text-muted-foreground text-sm">来自各板块的最新发布</p>
            </div>
          </div>

          <div className="space-y-3">
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
                    <div className="group flex items-start gap-4 p-4 sm:p-5 rounded-xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer">
                      <span className="text-3xl font-bold text-muted-foreground/15 leading-none shrink-0 w-8 text-right tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/60">{cat?.tag}</span>
                          <span className="text-[10px] text-muted-foreground/40">·</span>
                          <span className="text-[10px] text-muted-foreground/50">{article.date}</span>
                        </div>
                        <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {article.title}
                        </h3>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary/50 transition-all shrink-0 mt-1 group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center"
          style={{
            background: "linear-gradient(135deg, oklch(0.705 0.191 47.604 / 0.06) 0%, oklch(0.705 0.191 47.604 / 0.02) 100%)",
            border: "1px solid oklch(0.705 0.191 47.604 / 0.1)",
          }}
        >
          <img src={LOGO_URL} alt="" className="h-10 w-10 rounded-xl mx-auto mb-5 opacity-80" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            加入深象，一起探索一人公司的无限可能
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto mb-8">
            无论你是正在探索独立创业的新手，还是已经在路上的 Solopreneur，这里都有适合你的内容和工具。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/site/news">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium text-sm btn-press hover:bg-primary/90 transition-colors shadow-sm">
                浏览最新内容
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/site/toolkit">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium text-sm btn-press hover:bg-accent transition-colors">
                探索工具图谱
              </span>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
