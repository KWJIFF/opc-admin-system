import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight, Clock, User, TrendingUp, Eye, ThumbsUp,
  Play, Headphones, Download, Sparkles, BarChart3, Flame, Zap,
  ChevronRight,
} from "lucide-react";
import { getCategoryIcon } from "@/components/SiteLayout";
import {
  getEnabledCategories, getLatestArticles, getTrendingArticles,
  getFeaturedArticles, getArticlesByMediaType,
  getCategoryByKey, formatDuration, formatCount,
  TREND_DATA, type SiteArticle,
} from "@shared/siteConfig";
import { toast } from "sonner";

const categories = getEnabledCategories();

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

function HeroSection() {
  const featured = getFeaturedArticles(3);
  const [activeIdx, setActiveIdx] = useState(0);
  const active = featured[activeIdx];
  const cat = active ? getCategoryByKey(active.categoryKey) : null;
  const Icon = cat ? getCategoryIcon(cat.iconName) : null;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-primary/2 pointer-events-none" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 sm:pt-8 pb-10 sm:pb-14">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          <motion.div {...fadeUp} className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">AI 精选推荐</span>
            </div>
            {active && (
              <Link href={`/site/article/${active.id}`}>
                <div className="group relative p-5 sm:p-7 rounded-2xl bg-card border border-border/50 card-elevated cursor-pointer active:scale-[0.99] transition-transform">
                  <div className="flex items-center gap-2 mb-3">
                    {cat && Icon && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/6 text-primary text-xs font-medium"><Icon className="h-3 w-3" />{cat.label}</span>}
                    {active.mediaType === "video" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-medium"><Play className="h-2.5 w-2.5" />视频</span>}
                    {active.mediaType === "podcast" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-medium"><Headphones className="h-2.5 w-2.5" />播客</span>}
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-3 max-w-2xl">{active.title}</h2>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mb-5 line-clamp-3">{active.summary}</p>
                  <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground/60">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{active.author}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{active.readTime}</span>
                    <span>{active.date}</span>
                    {active.viewCount && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatCount(active.viewCount)}</span>}
                  </div>
                  <ArrowRight className="absolute top-5 right-5 sm:top-7 sm:right-7 h-5 w-5 text-muted-foreground/20 group-hover:text-primary/50 transition-all group-hover:translate-x-0.5" />
                </div>
              </Link>
            )}
            <div className="flex items-center gap-2 mt-4">
              {featured.map((_, i) => (
                <button key={i} onClick={() => setActiveIdx(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? "w-8 bg-primary" : "w-3 bg-border hover:bg-muted-foreground/30"}`} />
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ delay: 0.15, duration: 0.5 }} className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">行业脉搏</span>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 card-elevated">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {TREND_DATA.industryMetrics.map((m) => (
                  <div key={m.label} className="p-3 rounded-xl bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground/60 mb-1 truncate">{m.label}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-foreground">{m.value >= 100 ? formatCount(m.value * 10000) : m.value}{m.label.includes("率") ? "%" : ""}</span>
                      <span className="text-[10px] font-medium text-green-600 flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5" />+{m.change}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mb-3">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-xs font-semibold text-foreground">热门关键词</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TREND_DATA.hotKeywords.slice(0, 12).map((kw, i) => (
                  <span key={kw.text} className="px-2 py-0.5 rounded-md font-medium cursor-default" style={{ background: i < 3 ? `oklch(0.95 0.04 ${47 + i * 20})` : "var(--secondary)", color: i < 3 ? `oklch(0.5 0.15 ${47 + i * 20})` : "var(--muted-foreground)", fontSize: `${Math.max(10, 13 - i * 0.3)}px` }}>{kw.text}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ArticleRow({ article }: { article: SiteArticle }) {
  const cat = getCategoryByKey(article.categoryKey);
  const Icon = cat ? getCategoryIcon(cat.iconName) : null;
  return (
    <motion.div variants={fadeUp}>
      <Link href={`/site/article/${article.id}`}>
        <div className="group flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.99]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {cat && Icon && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/6 text-primary text-[10px] font-medium"><Icon className="h-2.5 w-2.5" />{cat.label}</span>}
              {article.mediaType === "video" && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-medium"><Play className="h-2.5 w-2.5" />视频</span>}
              {article.mediaType === "podcast" && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-medium"><Headphones className="h-2.5 w-2.5" />播客</span>}
              {article.mediaType === "report" && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-medium"><Download className="h-2.5 w-2.5" />报告</span>}
            </div>
            <h3 className="text-[15px] sm:text-base font-medium text-foreground group-hover:text-primary transition-colors leading-snug mb-1.5 line-clamp-2">{article.title}</h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2 mb-2.5 hidden sm:block">{article.summary}</p>
            <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-[11px] text-muted-foreground/50">
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
              <span>{article.date}</span>
              {article.viewCount && <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{formatCount(article.viewCount)}</span>}
              {article.duration && <span className="flex items-center gap-0.5"><Play className="h-3 w-3" />{formatDuration(article.duration)}</span>}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary/50 transition-all shrink-0 mt-1 group-hover:translate-x-0.5 hidden sm:block" />
        </div>
      </Link>
    </motion.div>
  );
}

function LatestStream() {
  const latest = getLatestArticles(8);
  const trending = getTrendingArticles(5);
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-16">
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }} className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-5"><Zap className="h-4 w-4 text-primary" /><h2 className="text-lg font-bold text-foreground">最新发布</h2></div>
          <div className="space-y-2.5">{latest.map((a) => <ArticleRow key={a.id} article={a} />)}</div>
        </motion.div>
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-5"><Flame className="h-4 w-4 text-orange-500" /><h2 className="text-lg font-bold text-foreground">热门排行</h2></div>
          <div className="p-4 rounded-2xl bg-card border border-border/50 card-elevated space-y-1">
            {trending.map((a, i) => (
              <Link key={a.id} href={`/site/article/${a.id}`}>
                <div className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                  <span className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-primary/10 text-primary" : i === 1 ? "bg-orange-50 text-orange-500" : i === 2 ? "bg-amber-50 text-amber-600" : "bg-secondary text-muted-foreground"}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1">{a.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50">
                      <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{formatCount(a.viewCount || 0)}</span>
                      <span className="flex items-center gap-0.5"><ThumbsUp className="h-2.5 w-2.5" />{formatCount(a.likeCount || 0)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function VideoSection() {
  const videos = getArticlesByMediaType("video", 4);
  if (!videos.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-16">
      <motion.div {...fadeUp}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2"><Play className="h-4 w-4 text-red-500" /><h2 className="text-lg font-bold text-foreground">视频精选</h2></div>
          <Link href="/site/videos"><span className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">查看全部<ChevronRight className="h-3 w-3" /></span></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {videos.map((v) => (
            <Link key={v.id} href={`/site/article/${v.id}`}>
              <div className="group rounded-xl bg-card border border-border/40 overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.99]">
                <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform"><Play className="h-5 w-5 text-red-500 ml-0.5" /></div>
                  {v.duration && <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-medium">{formatDuration(v.duration)}</span>}
                </div>
                <div className="p-3">
                  <h4 className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">{v.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50"><span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{formatCount(v.viewCount || 0)}</span><span>{v.date}</span></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function PodcastSection() {
  const pods = getArticlesByMediaType("podcast", 3);
  if (!pods.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-16">
      <motion.div {...fadeUp}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2"><Headphones className="h-4 w-4 text-purple-500" /><h2 className="text-lg font-bold text-foreground">播客频道</h2></div>
          <Link href="/site/podcasts"><span className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">查看全部<ChevronRight className="h-3 w-3" /></span></Link>
        </div>
        <div className="space-y-3">
          {pods.map((ep) => (
            <Link key={ep.id} href={`/site/article/${ep.id}`}>
              <div className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border/40 hover:border-purple-200 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.99]">
                <div className="shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center"><Headphones className="h-7 w-7 text-purple-400" /></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-medium text-foreground group-hover:text-purple-600 transition-colors line-clamp-1 leading-snug mb-1">{ep.title}</h4>
                  <p className="text-[12px] text-muted-foreground line-clamp-1 mb-1.5">{ep.summary}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
                    {ep.duration && <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{formatDuration(ep.duration)}</span>}
                    <span>{ep.date}</span>
                    <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{formatCount(ep.viewCount || 0)}</span>
                  </div>
                </div>
                <Play className="h-8 w-8 p-1.5 rounded-full bg-purple-50 text-purple-500 shrink-0 group-hover:bg-purple-100 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function CategoryGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-16">
      <motion.div {...fadeUp}>
        <div className="flex items-center gap-2 mb-5"><BarChart3 className="h-4 w-4 text-primary" /><h2 className="text-lg font-bold text-foreground">内容板块</h2></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.iconName);
            return (
              <Link key={cat.key} href={cat.path}>
                <div className="group p-4 rounded-xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98] text-center">
                  <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-primary/6 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors"><Icon className="h-5 w-5" /></div>
                  <h3 className="text-sm font-medium text-foreground mb-1">{cat.label}</h3>
                  <p className="text-[11px] text-muted-foreground/60 line-clamp-2 leading-relaxed">{cat.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

function SubscribeCTA() {
  const [email, setEmail] = useState("");
  const handleSubscribe = () => {
    if (!email.trim()) { toast.error("请输入邮箱地址"); return; }
    toast.success("订阅成功！我们会定期发送精选内容到您的邮箱。");
    setEmail("");
  };
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-16">
      <motion.div {...fadeUp}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/8 via-primary/4 to-transparent border border-primary/10 p-6 sm:p-10 text-center">
          <Sparkles className="h-8 w-8 text-primary/40 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">订阅深象精选</h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-lg mx-auto">每周精选一人公司创业洞察、AI 工具推荐和实战案例，直达你的邮箱。</p>
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 h-10 px-4 rounded-xl bg-background border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" onKeyDown={(e) => e.key === "Enter" && handleSubscribe()} />
            <button onClick={handleSubscribe} className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all shrink-0">订阅</button>
          </div>
          <p className="text-[11px] text-muted-foreground/40 mt-3">无垃圾邮件，随时退订</p>
        </div>
      </motion.div>
    </section>
  );
}

function SocialFollow() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-16">
      <motion.div {...fadeUp}>
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-foreground mb-2">关注我们的全媒体矩阵</h2>
          <p className="text-sm text-muted-foreground">在你常用的平台上获取最新内容</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {[
            { name: "微信公众号", desc: "深度长文 · 周报", cls: "bg-green-50 text-green-600 hover:bg-green-100 border-green-100" },
            { name: "小红书", desc: "干货笔记 · 工具种草", cls: "bg-red-50 text-red-500 hover:bg-red-100 border-red-100" },
            { name: "知乎", desc: "专业回答 · 深度分析", cls: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100" },
            { name: "B站", desc: "视频教程 · 工具演示", cls: "bg-pink-50 text-pink-500 hover:bg-pink-100 border-pink-100" },
          ].map((p) => (
            <button key={p.name} onClick={() => toast.info(`${p.name}账号即将上线，敬请期待！`)} className={`p-4 rounded-xl border ${p.cls} transition-all duration-300 cursor-pointer active:scale-[0.97]`}>
              <div className="text-sm font-medium mb-1">{p.name}</div>
              <div className="text-[11px] opacity-60">{p.desc}</div>
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
      <VideoSection />
      <PodcastSection />
      <CategoryGrid />
      <SubscribeCTA />
      <SocialFollow />
    </div>
  );
}
