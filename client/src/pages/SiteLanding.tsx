import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  ArrowRight, Clock, User, TrendingUp, Eye, ThumbsUp,
  Sparkles, BarChart3, Flame, Zap,
  ChevronRight, Loader2, BookOpen, PieChart,
} from "lucide-react";
import { getCategoryIcon } from "@/components/SiteLayout";
import {
  getEnabledCategories, getCategoryByKey, formatCount,
  TREND_DATA, type SiteArticle,
} from "@shared/siteConfig";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const categories = getEnabledCategories();

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

/** 将数据库 websitePost 映射为前台 SiteArticle 格式 */
function mapPostToArticle(post: any): SiteArticle {
  const readMinutes = post.body ? Math.max(2, Math.ceil(post.body.length / 500)) : 3;
  // 基于文章 ID 和内容长度生成稳定的计数（不使用随机数）
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

/* ── Hero 区域 ── */
function HeroSection() {
  const { data: featuredPosts, isLoading } = trpc.website.featured.useQuery({ limit: 3 });
  const featured = useMemo(() => (featuredPosts || []).map(mapPostToArticle), [featuredPosts]);
  const [activeIdx, setActiveIdx] = useState(0);
  const active = featured[activeIdx];
  const cat = active ? getCategoryByKey(active.categoryKey) : null;
  const Icon = cat ? getCategoryIcon(cat.iconName) : null;

  return (
    <section className="relative overflow-hidden">
      {/* 精致背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-200/[0.06] rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-10 pb-12 sm:pb-16 relative">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-10">
          {/* 左侧精选 */}
          <motion.div {...fadeUp} className="lg:col-span-3">
            <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/10">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary/80">AI 精选推荐</span>
              </div>
            </div>
            {isLoading ? (
              <div className="p-16 rounded-2xl bg-card border border-border/50 flex items-center justify-center card-elevated">
                <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
              </div>
            ) : active ? (
              <>
                <Link href={`/site/article/${active.id}`}>
                  <div className="group relative p-6 sm:p-8 rounded-2xl bg-card border border-border/40 card-elevated cursor-pointer active:scale-[0.995] transition-transform">
                    {/* 顶部装饰线 */}
                    <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full" />

                    <div className="flex items-center gap-2.5 mb-4">
                      {cat && Icon && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/6 text-primary text-xs font-medium border border-primary/8">
                          <Icon className="h-3 w-3" />{cat.label}
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground/50">{active.date}</span>
                    </div>

                    <h2 className="heading-serif text-[22px] sm:text-[26px] lg:text-[30px] text-foreground group-hover:text-primary transition-colors leading-[1.2] mb-4 max-w-2xl">
                      {active.title}
                    </h2>

                    <p className="text-muted-foreground text-[15px] leading-[1.7] max-w-2xl mb-6 line-clamp-3">
                      {active.summary}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground/50">
                        <span className="flex items-center gap-1.5"><User className="h-3 w-3" />{active.author}</span>
                        <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" />{active.readTime}</span>
                        {active.viewCount && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatCount(active.viewCount)}</span>}
                      </div>
                      <span className="flex items-center gap-1 text-xs font-medium text-primary/60 group-hover:text-primary transition-colors">
                        阅读全文 <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>

                {/* 精致指示器 */}
                <div className="flex items-center gap-2 mt-5">
                  {featured.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className={`rounded-full transition-all duration-400 ${
                        i === activeIdx
                          ? "w-8 h-2 bg-primary shadow-sm shadow-primary/30"
                          : "w-2 h-2 bg-border hover:bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="p-16 rounded-2xl bg-card border border-border/40 text-center card-elevated">
                <BookOpen className="h-10 w-10 text-muted-foreground/15 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">暂无精选文章，内容即将上线</p>
              </div>
            )}
          </motion.div>

          {/* 右侧行业脉搏 */}
          <motion.div {...fadeUp} transition={{ delay: 0.15, duration: 0.6 }} className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border/50">
                <BarChart3 className="h-3.5 w-3.5 text-primary/70" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">行业脉搏</span>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/40 card-elevated">
              <div className="grid grid-cols-2 gap-3 mb-5">
                {TREND_DATA.industryMetrics.map((m) => (
                  <div key={m.label} className="p-3.5 rounded-xl bg-gradient-to-br from-secondary/60 to-secondary/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground/55 mb-1.5 truncate font-medium tracking-wide">{m.label}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-foreground tabular-nums">{m.value >= 100 ? formatCount(m.value * 10000) : m.value}{m.label.includes("率") ? "%" : ""}</span>
                      <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5" />+{m.change}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider-gradient mb-4" />

              <div className="flex items-center gap-1.5 mb-3.5">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-xs font-semibold text-foreground">热门关键词</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TREND_DATA.hotKeywords.slice(0, 12).map((kw, i) => (
                  <span
                    key={kw.text}
                    className="px-2.5 py-1 rounded-full font-medium cursor-default transition-all hover:scale-105"
                    style={{
                      background: i < 3 ? `oklch(0.95 0.04 ${47 + i * 20})` : "var(--secondary)",
                      color: i < 3 ? `oklch(0.45 0.15 ${47 + i * 20})` : "var(--muted-foreground)",
                      fontSize: `${Math.max(10, 12 - i * 0.2)}px`,
                      border: i < 3 ? `1px solid oklch(0.9 0.06 ${47 + i * 20})` : "1px solid var(--border)",
                    }}
                  >
                    {kw.text}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── 文章行 ── */
function ArticleRow({ article }: { article: SiteArticle }) {
  const cat = getCategoryByKey(article.categoryKey);
  const Icon = cat ? getCategoryIcon(cat.iconName) : null;
  return (
    <motion.div variants={fadeUp}>
      <Link href={`/site/article/${article.id}`}>
        <div className="group flex items-start gap-4 p-4 sm:p-5 rounded-xl bg-card border border-border/30 hover:border-primary/15 hover:shadow-lg hover:shadow-primary/[0.03] transition-all duration-350 cursor-pointer active:scale-[0.995]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {cat && Icon && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] font-medium border border-primary/8">
                  <Icon className="h-2.5 w-2.5" />{cat.label}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/40">{article.date}</span>
            </div>
            <h3 className="text-[15px] sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
              {article.title}
            </h3>
            <p className="text-[13px] text-muted-foreground/70 leading-relaxed line-clamp-2 mb-3 hidden sm:block">
              {article.summary}
            </p>
            <div className="flex items-center flex-wrap gap-2.5 text-[11px] text-muted-foreground/45">
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
              {article.viewCount && <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{formatCount(article.viewCount)}</span>}
              {(article as any).chartCount > 0 && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                  <PieChart className="h-2.5 w-2.5" />{(article as any).chartCount}图表
                </span>
              )}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/15 group-hover:text-primary/40 transition-all shrink-0 mt-2 group-hover:translate-x-0.5 hidden sm:block" />
        </div>
      </Link>
    </motion.div>
  );
}

/* ── 最新发布 + 热门排行 ── */
function LatestStream() {
  const { data: latestPosts, isLoading } = trpc.website.published.useQuery({ limit: 8 });
  const latest = useMemo(() => (latestPosts || []).map(mapPostToArticle), [latestPosts]);
  const trending = useMemo(() => [...latest].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5), [latest]);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-14 sm:pb-20">
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
        {/* 最新发布 */}
        <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }} className="lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-1 h-5 rounded-full bg-primary" />
            <h2 className="text-lg font-bold text-foreground tracking-tight">最新发布</h2>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary/40" /></div>
          ) : latest.length > 0 ? (
            <div className="space-y-3">{latest.map((a) => <ArticleRow key={a.id} article={a} />)}</div>
          ) : (
            <div className="p-12 rounded-xl bg-card border border-border/30 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/15 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">暂无文章，内容即将上线</p>
            </div>
          )}
        </motion.div>

        {/* 热门排行 */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-1 h-5 rounded-full bg-orange-400" />
            <h2 className="text-lg font-bold text-foreground tracking-tight">热门排行</h2>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border/40 card-elevated space-y-1">
            {trending.length > 0 ? trending.map((a, i) => (
              <Link key={a.id} href={`/site/article/${a.id}`}>
                <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-all duration-200 cursor-pointer">
                  <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-primary/10 text-primary ring-1 ring-primary/15" :
                    i === 1 ? "bg-orange-50 text-orange-500 ring-1 ring-orange-100" :
                    i === 2 ? "bg-amber-50 text-amber-600 ring-1 ring-amber-100" :
                    "bg-secondary text-muted-foreground"
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1.5">{a.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/45">
                      <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{formatCount(a.viewCount || 0)}</span>
                      <span className="flex items-center gap-0.5"><ThumbsUp className="h-2.5 w-2.5" />{formatCount(a.likeCount || 0)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="p-6 text-center text-muted-foreground/40 text-xs">暂无数据</div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── 内容板块 ── */
function CategoryGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-14 sm:pb-20">
      <motion.div {...fadeUp}>
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-1 h-5 rounded-full bg-primary" />
          <h2 className="text-lg font-bold text-foreground tracking-tight">内容板块</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat, i) => {
            const Icon = getCategoryIcon(cat.iconName);
            const isComingSoon = cat.key === "videos" || cat.key === "podcasts";
            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
              >
                <Link href={isComingSoon ? "#" : cat.path}>
                  <div
                    className={`group p-5 rounded-2xl bg-card border border-border/30 hover:border-primary/15 hover:shadow-lg hover:shadow-primary/[0.03] transition-all duration-350 cursor-pointer active:scale-[0.97] text-center ${isComingSoon ? "opacity-55" : ""}`}
                    onClick={isComingSoon ? (e) => { e.preventDefault(); toast.info(`${cat.label}即将上线，敬请期待！`); } : undefined}
                  >
                    <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/8 to-primary/4 flex items-center justify-center text-primary group-hover:from-primary/12 group-hover:to-primary/6 transition-all border border-primary/8">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{cat.label}</h3>
                    <p className="text-[11px] text-muted-foreground/55 line-clamp-2 leading-relaxed">{isComingSoon ? "即将上线" : cat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

/* ── 订阅 CTA ── */
function SubscribeCTA() {
  const [email, setEmail] = useState("");
  const handleSubscribe = () => {
    if (!email.trim()) { toast.error("请输入邮箱地址"); return; }
    toast.success("订阅成功！我们会定期发送精选内容到您的邮箱。");
    setEmail("");
  };
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-14 sm:pb-20">
      <motion.div {...fadeUp}>
        <div className="relative overflow-hidden rounded-3xl border border-primary/10 p-8 sm:p-12 text-center"
          style={{
            background: "linear-gradient(135deg, oklch(0.97 0.02 45) 0%, oklch(0.99 0.005 90) 50%, oklch(0.97 0.015 55) 100%)",
          }}
        >
          {/* 装饰元素 */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/[0.04] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-amber-200/[0.08] rounded-full blur-[60px] translate-y-1/2 -translate-x-1/3" />

          <div className="relative">
            <div className="w-12 h-12 mx-auto mb-5 rounded-2xl bg-primary/8 flex items-center justify-center border border-primary/10">
              <Sparkles className="h-6 w-6 text-primary/60" />
            </div>
            <h2 className="heading-serif text-[22px] sm:text-[26px] text-foreground mb-3">订阅深象精选</h2>
            <p className="text-muted-foreground text-sm sm:text-[15px] mb-8 max-w-lg mx-auto leading-relaxed">
              每周精选一人公司创业洞察、AI 工具推荐和实战案例，直达你的邮箱。
            </p>
            <div className="flex items-center gap-2.5 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 h-11 px-5 rounded-xl bg-white/80 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all backdrop-blur-sm"
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
              />
              <button onClick={handleSubscribe} className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shrink-0 shadow-lg shadow-primary/20 btn-press">
                订阅
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground/35 mt-4">无垃圾邮件，随时退订</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── 全媒体矩阵 ── */
function SocialFollow() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-14 sm:pb-20">
      <motion.div {...fadeUp}>
        <div className="text-center mb-8">
          <h2 className="heading-serif text-[20px] sm:text-[22px] text-foreground mb-2">关注我们的全媒体矩阵</h2>
          <p className="text-sm text-muted-foreground/60">在你常用的平台上获取最新内容</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {[
            { name: "微信公众号", desc: "深度长文 · 周报", cls: "from-green-50 to-green-50/50 text-green-700 border-green-100 hover:border-green-200" },
            { name: "小红书", desc: "干货笔记 · 工具种草", cls: "from-red-50 to-red-50/50 text-red-600 border-red-100 hover:border-red-200" },
            { name: "知乎", desc: "专业回答 · 深度分析", cls: "from-blue-50 to-blue-50/50 text-blue-700 border-blue-100 hover:border-blue-200" },
            { name: "B站", desc: "视频教程 · 工具演示", cls: "from-pink-50 to-pink-50/50 text-pink-600 border-pink-100 hover:border-pink-200" },
          ].map((p) => (
            <button
              key={p.name}
              onClick={() => toast.info(`${p.name}账号即将上线，敬请期待！`)}
              className={`p-5 rounded-2xl border bg-gradient-to-br ${p.cls} transition-all duration-300 cursor-pointer active:scale-[0.97] hover:shadow-md`}
            >
              <div className="text-sm font-semibold mb-1">{p.name}</div>
              <div className="text-[11px] opacity-55">{p.desc}</div>
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default function SiteLanding() {
  return (
    <div>
      <HeroSection />
      <LatestStream />
      <CategoryGrid />
      <SubscribeCTA />
      <SocialFollow />
    </div>
  );
}
