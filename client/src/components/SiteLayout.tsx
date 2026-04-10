import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Menu, X, Info, LayoutDashboard,
  Newspaper, Brain, BookOpen, Scale, Target, FileBarChart, Wrench, Play, Headphones,
} from "lucide-react";
import { getEnabledCategories } from "@shared/siteConfig";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695431/Fb26PagKyopspprUoxxADo/logo-icon_48921fa8.webp";

/* ── 图标映射：iconName → 组件 ── */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Newspaper, Brain, BookOpen, Scale, Target, FileBarChart, Wrench, Play, Headphones,
};

export function getCategoryIcon(iconName: string) {
  return ICON_MAP[iconName] || Newspaper;
}

/* ── 获取启用的板块 ── */
const categories = getEnabledCategories();

/* ── 顶部导航 ── */
function SiteNav() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  /* 路由变化时关闭移动菜单 */
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  /* 移动菜单打开时禁止 body 滚动 */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <div
          className="flex h-14 sm:h-16 items-center justify-between rounded-b-2xl px-3 sm:px-6"
          style={{
            background: "rgba(255, 255, 255, 0.72)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <Link href="/site" className="flex items-center gap-2 shrink-0">
            <img src={LOGO_URL} alt="深象科技" className="h-7 w-7 rounded-lg" />
            <span className="font-semibold text-[15px] tracking-tight text-foreground">
              深象 OPCS
            </span>
          </Link>

          {/* 桌面端导航 */}
          <div className="hidden lg:flex items-center gap-0.5">
            {categories.map((cat) => {
              const isActive = location === cat.path || location.startsWith(cat.path + "/");
              return (
                <Link key={cat.key} href={cat.path}>
                  <span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    isActive ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}>
                    {cat.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/site/about">
              <span className="text-muted-foreground hover:text-foreground transition-colors p-2 hidden sm:block">
                <Info className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/">
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-primary/80 hover:text-primary hover:bg-primary/8 transition-all duration-200">
                <LayoutDashboard className="h-3.5 w-3.5" />
                管理后台
              </span>
            </Link>
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors active:scale-95"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "关闭菜单" : "打开菜单"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 移动端全屏菜单 */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 top-14 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            {/* 菜单面板 */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden fixed left-3 right-3 top-[62px] rounded-2xl overflow-hidden z-50"
              style={{
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                maxHeight: "calc(100vh - 80px)",
                overflowY: "auto",
              }}
            >
              <div className="p-2">
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.iconName);
                  const isActive = location === cat.path;
                  return (
                    <Link key={cat.key} href={cat.path}>
                      <span
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] transition-all active:scale-[0.98] ${
                          isActive ? "text-primary bg-primary/8 font-medium" : "text-foreground/80 active:bg-accent"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0 opacity-60" />
                        {cat.label}
                      </span>
                    </Link>
                  );
                })}
                <div className="border-t border-border/40 my-1.5 mx-4" />
                <Link href="/site/about">
                  <span className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] text-foreground/80 active:bg-accent active:scale-[0.98] transition-all">
                    <Info className="h-[18px] w-[18px] shrink-0 opacity-60" />
                    关于我们
                  </span>
                </Link>
                <Link href="/">
                  <span className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] text-primary/80 active:bg-primary/8 active:scale-[0.98] transition-all">
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

/* ── 页脚 ── */
function SiteFooter() {
  const half = Math.ceil(categories.length / 2);
  return (
    <footer className="border-t border-border/40 mt-16 sm:mt-20 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 品牌区 - 移动端占满两列 */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <img src={LOGO_URL} alt="深象科技" className="h-7 w-7 rounded-lg" />
              <span className="font-semibold text-base text-foreground">深象 OPCS</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              一人公司创业者的内容运营服务平台。用结构化方法论和 AI 工具链，帮助独立创业者高效运营。
            </p>
          </div>
          {/* 内容板块链接 */}
          <div>
            <h4 className="text-muted-foreground/60 text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">内容板块</h4>
            <div className="space-y-2 sm:space-y-2.5">
              {categories.slice(0, half).map((cat) => (
                <Link key={cat.key} href={cat.path}>
                  <span className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-muted-foreground/60 text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">更多</h4>
            <div className="space-y-2 sm:space-y-2.5">
              {categories.slice(half).map((cat) => (
                <Link key={cat.key} href={cat.path}>
                  <span className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5">{cat.label}</span>
                </Link>
              ))}
              <Link href="/site/about">
                <span className="block text-muted-foreground hover:text-foreground text-sm transition-colors py-0.5">关于我们</span>
              </Link>
            </div>
          </div>
          {/* 联系 - 移动端隐藏（在关于页面有），桌面端显示 */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="text-muted-foreground/60 text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">联系</h4>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>深象科技（杭州）</p>
              <p>contact@opcs.vip</p>
              <a href="https://opcs.vip" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors block">opcs.vip</a>
            </div>
          </div>
        </div>
        <div className="border-t border-border/40 mt-8 sm:mt-10 pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground/50 text-xs">&copy; {new Date().getFullYear()} 深象科技. All rights reserved.</p>
          <div className="flex items-center gap-4 text-muted-foreground/50 text-xs">
            <span className="hover:text-muted-foreground transition-colors cursor-pointer">隐私政策</span>
            <span className="hover:text-muted-foreground transition-colors cursor-pointer">服务条款</span>
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
