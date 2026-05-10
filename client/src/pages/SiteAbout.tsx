import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Target, Lightbulb, Zap, Users, Globe, Mail, Sparkles, TrendingUp } from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695431/Fb26PagKyopspprUoxxADo/logo-master_f43d4fa5.png";

const values = [
  { icon: Target, title: "专注深耕", desc: "深耕一人公司领域，不做大而全，只做深而精。每一篇内容都经过严格的研究和验证。", accent: "from-blue-500/10 to-blue-500/5" },
  { icon: Lightbulb, title: "认知先行", desc: "相信认知升级是创业成功的前提。我们不只传递信息，更传递思维方式和决策框架。", accent: "from-amber-500/10 to-amber-500/5" },
  { icon: Zap, title: "工具驱动", desc: "善用 AI 和自动化工具提升效率，让一个人也能拥有一支团队的产出能力。", accent: "from-emerald-500/10 to-emerald-500/5" },
  { icon: Users, title: "社区共建", desc: "连接全球一人公司创业者，共享经验、资源和机会，让独立不再孤独。", accent: "from-purple-500/10 to-purple-500/5" },
];

const milestones = [
  { year: "2024", event: "深象科技成立，开始一人公司领域研究", status: "completed" },
  { year: "2025", event: "发布 OPC 方法论 1.0，服务首批创业者", status: "completed" },
  { year: "2026", event: "OPCS 平台上线，内容矩阵覆盖 7 大板块", status: "current" },
];

const stats = [
  { label: "内容板块", value: "7+", icon: Sparkles },
  { label: "AI 驱动", value: "24/7", icon: Zap },
  { label: "持续增长", value: "∞", icon: TrendingUp },
];

export default function SiteAbout() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero — 大气开场 */}
      <section className="pt-6 sm:pt-10 lg:pt-20 pb-12 sm:pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative inline-block mb-6 sm:mb-8">
            <img src={LOGO_URL} alt="深象科技" className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl mx-auto shadow-lg shadow-primary/10" />
            <div className="absolute -inset-3 rounded-3xl bg-primary/5 -z-10" />
          </div>
          <h1 className="heading-serif text-[28px] sm:text-4xl lg:text-5xl text-foreground leading-[1.15] mb-5 sm:mb-6">
            关于<span className="text-primary">深象科技</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground/70 leading-[1.8] max-w-2xl mx-auto">
            深象科技是一家专注于一人公司领域的内容科技公司。我们相信，在 AI 时代，一个人加上正确的方法论和工具链，就能创造出超越传统团队的价值。
          </p>
        </motion.div>

        {/* 数据亮点 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-6 sm:gap-12 mt-10 sm:mt-14"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <s.icon className="h-4 w-4 text-primary/50" />
                <span className="heading-serif text-2xl sm:text-3xl text-foreground">{s.value}</span>
              </div>
              <span className="text-[11px] sm:text-xs text-muted-foreground/45 font-medium">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* 分隔线 */}
      <div className="divider-gradient mb-12 sm:mb-16" />

      {/* Mission — 精致卡片 */}
      <section className="pb-14 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl p-8 sm:p-10 lg:p-14 bg-card border border-border/30 overflow-hidden text-center"
        >
          {/* 装饰 */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/3 rounded-full blur-3xl" />

          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/50 mb-4 block">Our Mission</span>
          <h2 className="heading-serif text-xl sm:text-2xl lg:text-3xl text-foreground mb-4 sm:mb-5">
            让每一位独立创业者都能高效运营
          </h2>
          <p className="text-muted-foreground/65 text-[14px] sm:text-[15px] lg:text-base leading-[1.8] max-w-2xl mx-auto">
            通过深度研究、结构化内容和智能工具，降低一人公司的运营门槛，提升独立创业者的决策质量和执行效率。我们不只是内容平台，更是一人公司创业者的认知基础设施。
          </p>
        </motion.div>
      </section>

      {/* Values — 渐变卡片 */}
      <section className="pb-14 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/50 mb-3 block">Core Values</span>
          <h2 className="heading-serif text-xl sm:text-2xl lg:text-3xl text-foreground mb-2 sm:mb-3">核心价值观</h2>
          <p className="text-muted-foreground/55 text-sm sm:text-[15px]">驱动我们前行的信念</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group p-6 sm:p-7 rounded-2xl bg-card border border-border/30 hover:border-primary/15 hover:shadow-lg hover:shadow-primary/[0.03] transition-all duration-350"
            >
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${v.accent} w-fit mb-4 group-hover:scale-105 transition-transform`}>
                <v.icon className="h-5 w-5 text-foreground/60" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">{v.title}</h3>
              <p className="text-[13px] sm:text-[14px] text-muted-foreground/60 leading-[1.7]">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline — 精致时间线 */}
      <section className="pb-14 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/50 mb-3 block">Our Journey</span>
          <h2 className="heading-serif text-xl sm:text-2xl lg:text-3xl text-foreground">发展历程</h2>
        </motion.div>

        <div className="max-w-xl mx-auto space-y-0">
          {milestones.map((m, i) => (
            <motion.div
              key={m.year}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-4 sm:gap-5"
            >
              <div className="shrink-0 w-14 sm:w-16 text-right pt-0.5">
                <span className={`heading-serif text-lg sm:text-xl ${m.status === "current" ? "text-primary" : "text-foreground/60"}`}>
                  {m.year}
                </span>
              </div>
              <div className="relative flex flex-col items-center shrink-0">
                <div className={`w-3 h-3 rounded-full mt-1.5 border-2 ${
                  m.status === "current"
                    ? "bg-primary border-primary/30 shadow-md shadow-primary/20"
                    : "bg-muted-foreground/20 border-muted-foreground/10"
                }`} />
                {i < milestones.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border/40 min-h-[40px]" />
                )}
              </div>
              <div className="pb-8 sm:pb-10 pt-0.5">
                <p className={`text-[14px] sm:text-[15px] leading-relaxed ${
                  m.status === "current" ? "text-foreground font-medium" : "text-muted-foreground/70"
                }`}>
                  {m.event}
                </p>
                {m.status === "current" && (
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[10px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    当前阶段
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact CTA — 精致设计 */}
      <section className="pb-8 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl p-8 sm:p-10 lg:p-14 bg-gradient-to-br from-secondary/40 to-secondary/20 border border-border/20 text-center overflow-hidden"
        >
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

          <h2 className="heading-serif text-xl sm:text-2xl text-foreground mb-6 sm:mb-8">联系我们</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground/60 mb-8">
            <a href="mailto:contact@opcs.vip" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Mail className="h-4 w-4 text-primary/50" />
              contact@opcs.vip
            </a>
            <a href="https://opcs.vip" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Globe className="h-4 w-4 text-primary/50" />
              opcs.vip
            </a>
          </div>
          <Link href="/site">
            <span className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press hover:bg-primary/90 transition-all shadow-lg shadow-primary/15">
              浏览我们的内容
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
