import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Menu, X, Info, LayoutDashboard, ArrowUpRight,
  Newspaper, Brain, BookOpen, Scale, Target, FileBarChart, Wrench, Play, Headphones,
} from "lucide-react";
import { getEnabledCategories } from "@shared/siteConfig";

const LOGO_ICON_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695431/Fb26PagKyopspprUoxxADo/logo-master_f43d4fa5.png";

/* ── 图标映射 ── */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Newspaper, Brain, BookOpen, Scale, Target, FileBarChart, Wrench, Play, Headphones,
};

export function getCategoryIcon(iconName: string) {
  return ICON_MAP[iconName] || Newspaper;
}

const categories = getEnabledCategories();

/* ── 顶部导航 — 高审美毛玻璃 ── */
function SiteNav() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* 滚动检测 — 增强阴影 */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <div
          className="flex h-14 sm:h-16 items-center justify-between rounded-b-2xl px-3 sm:px-6 transition-all duration-300"
          style={{
            background: scrolled ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.72)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(0,0,0,0.03)",
            boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          {/* Logo */}
          <Link href="/site" className="flex items-center gap-2.5 shrink-0 group">
            <img src={LOGO_ICON_URL} alt="深象科技" className="h-7 w-7 rounded-lg shadow-sm group-hover:shadow-md transition-shadow" />
            <div className="flex flex-col">
              <span className="font-bold text-[15px] tracking-tight text-foreground leading-tight">
                深象 × OPCS
              </span>
              <span className="text-[9px] text-muted-foreground/40 font-medium tracking-wider uppercase leading-none hidden sm:block">
                One Person Company Service
              </span>
            </div>
          </Link>

          {/* 桌面端导航 */}
          <div className="hidden lg:flex items-center gap-0.5">
            {categories.map((cat) => {
              const isActive = location === cat.path || location.startsWith(cat.path + "/");
              return (
                <Link key={cat.key} href={cat.path}>
                  <span className={`relative px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? "text-primary bg-primary/8"
                      : "text-muted-foreground/70 hover:text-foreground hover:bg-accent/50"
                  }`}>
                    {cat.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-primary"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* 右侧按钮 */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/site/about">
              <span className="text-muted-foreground/60 hover:text-foreground transition-colors p-2 hidden sm:block rounded-lg hover:bg-accent/50">
                <Info className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/">
              <span className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold text-primary/70 hover:text-primary hover:bg-primary/8 transition-all duration-200 border border-primary/10 hover:border-primary/20">
                <LayoutDashboard className="h-3.5 w-3.5" />
                管理后台
              </span>
            </Link>
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors active:scale-95"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "关闭菜单" : "打开菜单"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 top-14 bg-black/15 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden fixed left-3 right-3 top-[62px] rounded-2xl overflow-hidden z-50"
              style={{
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
                maxHeight: "calc(100vh - 80px)",
                overflowY: "auto",
              }}
            >
              <div className="p-2.5">
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.iconName);
                  const isActive = location === cat.path;
                  return (
                    <Link key={cat.key} href={cat.path}>
                      <span className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] transition-all active:scale-[0.98] ${
                        isActive ? "text-primary bg-primary/8 font-semibold" : "text-foreground/75 active:bg-accent/50"
                      }`}>
                        <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "opacity-80" : "opacity-40"}`} />
                        {cat.label}
                      </span>
                    </Link>
                  );
                })}
                <div className="border-t border-border/30 my-2 mx-4" />
                <Link href="/site/about">
                  <span className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] text-foreground/75 active:bg-accent/50 active:scale-[0.98] transition-all">
                    <Info className="h-[18px] w-[18px] shrink-0 opacity-40" />
                    关于我们
                  </span>
                </Link>
                <Link href="/">
                  <span className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] text-primary/80 active:bg-primary/8 active:scale-[0.98] transition-all font-medium">
                    <LayoutDashboard className="h-[18px] w-[18px] shrink-0 opacity-60" />
                    管理后台
                  </span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ── 页脚 — 精致设计 ── */
function SiteFooter() {
  const half = Math.ceil(categories.length / 2);
  return (
    <footer className="border-t border-border/30 mt-16 sm:mt-24 bg-gradient-to-b from-secondary/20 to-secondary/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* 品牌区 */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src={LOGO_ICON_URL} alt="深象科技" className="h-8 w-8 rounded-lg shadow-sm" />
              <div>
                <span className="font-bold text-base text-foreground block leading-tight">深象 × OPCS</span>
                <span className="text-[9px] text-muted-foreground/35 font-medium tracking-wider uppercase">One Person Company Service</span>
              </div>
            </div>
            <p className="text-muted-foreground/60 text-[13px] leading-[1.7] max-w-xs mb-4">
              一人公司创业者的内容运营服务平台。用结构化方法论和 AI 工具链，帮助独立创业者高效运营。
            </p>
            <a
              href="mailto:contact@opcs.vip"
              className="inline-flex items-center gap-1 text-xs text-primary/60 hover:text-primary transition-colors font-medium"
            >
              contact@opcs.vip <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>

          {/* 内容板块 */}
          <div>
            <h4 className="text-foreground/50 text-[11px] font-semibold uppercase tracking-widest mb-4">内容板块</h4>
            <div className="space-y-2.5">
              {categories.slice(0, half).map((cat) => (
                <Link key={cat.key} href={cat.path}>
                  <span className="block text-muted-foreground/60 hover:text-foreground text-[13px] transition-colors py-0.5">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-foreground/50 text-[11px] font-semibold uppercase tracking-widest mb-4">更多</h4>
            <div className="space-y-2.5">
              {categories.slice(half).map((cat) => (
                <Link key={cat.key} href={cat.path}>
                  <span className="block text-muted-foreground/60 hover:text-foreground text-[13px] transition-colors py-0.5">{cat.label}</span>
                </Link>
              ))}
              <Link href="/site/about">
                <span className="block text-muted-foreground/60 hover:text-foreground text-[13px] transition-colors py-0.5">关于我们</span>
              </Link>
            </div>
          </div>

          {/* 联系 */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="text-foreground/50 text-[11px] font-semibold uppercase tracking-widest mb-4">联系我们</h4>
            <div className="space-y-2.5 text-muted-foreground/60 text-[13px]">
              <p>深象科技（杭州）</p>
              <p>contact@opcs.vip</p>
              <a href="https://opcs.vip" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
                opcs.vip <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* 底部版权 + 备案 */}
        <div className="border-t border-border/25 mt-10 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-muted-foreground/40 text-[11px]">&copy; {new Date().getFullYear()} 深象科技. All rights reserved.</p>
            <div className="flex items-center flex-wrap justify-center gap-3 sm:gap-4 text-muted-foreground/40 text-[11px]">
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground/70 transition-colors">
                沪ICP备2026019026号
              </a>
              <span className="w-px h-3 bg-border/30 hidden sm:block" />
              <a href="https://www.beian.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground/70 transition-colors flex items-center gap-1">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABdSURBVDhPY/j//z8DsRgkRjRgYGBgZCASM4F0EYuJdhKxmGgn/f//n4FYzMTAwMBILGZiIBIzMRCJmRiIxEwMRGImBiIxEwORmImBSMzEQCRmYiASMzEQiQEAL3oLDpNFnLYAAAAASUVORK5CYII=" alt="" className="w-3 h-3" />
                公安备案号办理中
              </a>
              <span className="w-px h-3 bg-border/30 hidden sm:block" />
              <span className="hover:text-muted-foreground/70 transition-colors cursor-pointer">隐私政策</span>
              <span className="hover:text-muted-foreground/70 transition-colors cursor-pointer">服务条款</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── 主布局 ── */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="pt-16 sm:pt-20 pb-6 sm:pb-8">{children}</main>
      <SiteFooter />
    </div>
  );
}

export { SiteNav, SiteFooter };
