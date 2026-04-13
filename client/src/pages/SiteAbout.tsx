import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Target, Lightbulb, Zap, Users, Globe, Mail } from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695431/Fb26PagKyopspprUoxxADo/logo-master_f43d4fa5.png";

const values = [
  { icon: Target, title: "专注深耕", desc: "深耕一人公司领域，不做大而全，只做深而精。每一篇内容都经过严格的研究和验证。" },
  { icon: Lightbulb, title: "认知先行", desc: "相信认知升级是创业成功的前提。我们不只传递信息，更传递思维方式和决策框架。" },
  { icon: Zap, title: "工具驱动", desc: "善用 AI 和自动化工具提升效率，让一个人也能拥有一支团队的产出能力。" },
  { icon: Users, title: "社区共建", desc: "连接全球一人公司创业者，共享经验、资源和机会，让独立不再孤独。" },
];

const milestones = [
  { year: "2024", event: "深象科技成立，开始一人公司领域研究" },
  { year: "2025", event: "发布 OPC 方法论 1.0，服务首批创业者" },
  { year: "2026", event: "OPCS 平台上线，内容矩阵覆盖 7 大板块" },
];

export default function SiteAbout() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="pt-4 sm:pt-8 lg:pt-16 pb-10 sm:pb-16 lg:pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <img src={LOGO_URL} alt="深象科技" className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl mx-auto mb-5 sm:mb-6" />
          <h1 className="text-[26px] sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-foreground leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-6">
            关于<span className="text-primary">深象科技</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto px-2 sm:px-0">
            深象科技是一家专注于一人公司领域的内容科技公司。我们相信，在 AI 时代，一个人加上正确的方法论和工具链，就能创造出超越传统团队的价值。
          </p>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="pb-14 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-6 sm:p-8 lg:p-12 bg-card border border-border/50 card-elevated text-center"
        >
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-primary/60 mb-3 sm:mb-4 block">OUR MISSION</span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-4">
            让每一位独立创业者都能高效运营
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
            通过深度研究、结构化内容和智能工具，降低一人公司的运营门槛，提升独立创业者的决策质量和执行效率。我们不只是内容平台，更是一人公司创业者的认知基础设施。
          </p>
        </motion.div>
      </section>

      {/* Values */}
      <section className="pb-14 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">核心价值观</h2>
          <p className="text-muted-foreground text-sm sm:text-base">驱动我们前行的信念</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-5 sm:p-6 rounded-2xl bg-card border border-border/50 card-elevated"
            >
              <div className="p-2 sm:p-2.5 rounded-xl bg-primary/6 text-primary w-fit mb-3 sm:mb-4">
                <v.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 sm:mb-2">{v.title}</h3>
              <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="pb-14 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">发展历程</h2>
        </motion.div>

        <div className="max-w-xl mx-auto space-y-0">
          {milestones.map((m, i) => (
            <motion.div
              key={m.year}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-3 sm:gap-4"
            >
              <div className="shrink-0 w-12 sm:w-16 text-right pt-0.5">
                <span className="text-base sm:text-lg font-bold text-primary">{m.year}</span>
              </div>
              <div className="relative flex flex-col items-center shrink-0">
                <div className="w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full bg-primary/40 mt-1.5" />
                {i < milestones.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border/60 min-h-[32px]" />
                )}
              </div>
              <p className="text-foreground text-[14px] sm:text-sm leading-relaxed pb-6 sm:pb-8 pt-0.5">{m.event}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="pb-8 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-6 sm:p-8 lg:p-12 bg-secondary/30 border border-border/30 text-center"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-5 sm:mb-6">联系我们</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary/60" />
              <span>contact@opcs.vip</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary/60" />
              <a href="https://opcs.vip" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">opcs.vip</a>
            </div>
          </div>
          <div className="mt-6 sm:mt-8">
            <Link href="/site">
              <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium text-sm btn-press hover:bg-primary/90 transition-colors shadow-sm">
                浏览我们的内容
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
