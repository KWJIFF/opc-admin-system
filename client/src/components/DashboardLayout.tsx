import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  LogOut,
  PanelLeft,
  ExternalLink,
  Radar,
  Lightbulb,
  FileText,
  CheckCircle,
  Send,
  Share2,
  Calendar,
  Globe,
  BarChart3,
  TrendingUp,
  Workflow,
  Users,
  Shield,
  Settings,
  Activity,
  Database,
  ChevronRight,
  User,
  Bot,
  RefreshCw,
  MessageSquare,
  Mail,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695431/Fb26PagKyopspprUoxxADo/logo-master_f43d4fa5.png";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "总览",
    items: [
      { icon: LayoutDashboard, label: "仪表盘", path: "/" },
    ],
  },
  {
    label: "内容管理",
    items: [
      { icon: Radar, label: "情报中心", path: "/signals" },
      { icon: Lightbulb, label: "选题中心", path: "/topics" },
      { icon: FileText, label: "内容工厂", path: "/contents" },
      { icon: CheckCircle, label: "审核台", path: "/reviews" },
      { icon: Send, label: "发布台", path: "/publish" },
    ],
  },
  {
    label: "分发与运营",
    items: [
      { icon: Share2, label: "账号托管", path: "/accounts" },
      { icon: Calendar, label: "内容日历", path: "/calendar" },
      { icon: Globe, label: "网站文章", path: "/website" },
      { icon: BarChart3, label: "报告中心", path: "/reports" },
    ],
  },
  {
    label: "智能工具",
    items: [
      { icon: TrendingUp, label: "数据洞察", path: "/insights" },
      { icon: Bot, label: "AI 互动管理", path: "/ai-interactions" },
      { icon: RefreshCw, label: "数据循环建议", path: "/data-loop" },
      { icon: Workflow, label: "工作流", path: "/workflows" },
    ],
  },
  {
    label: "用户运营",
    items: [
      { icon: MessageSquare, label: "评论管理", path: "/comments" },
      { icon: Mail, label: "订阅管理", path: "/subscribers" },
    ],
  },
  {
    label: "系统管理",
    items: [
      { icon: Users, label: "团队成员", path: "/team" },
      { icon: Shield, label: "权限管理", path: "/permissions" },
      { icon: Activity, label: "系统监控", path: "/monitor" },
      { icon: Database, label: "来源管理", path: "/sources" },
      { icon: Settings, label: "系统设置", path: "/settings" },
    ],
  },
];

const allMenuItems = menuGroups.flatMap((g) => g.items);

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50/60 via-white to-orange-50/30">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center gap-8 p-10 max-w-md w-full relative"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.img
              src={LOGO_URL}
              alt="深象科技"
              className="w-18 h-18 rounded-[22px] shadow-xl shadow-primary/15"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
            <h1 className="text-2xl font-bold tracking-tight text-center text-foreground">
              深象 × OPCS
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
              内容运营管理平台，请登录后继续使用
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 btn-press rounded-xl h-12 text-[15px] font-semibold"
          >
            登录
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const activeMenuItem = allMenuItems.find((item) => {
    if (item.path === "/") return location === "/";
    return location.startsWith(item.path);
  });

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-sidebar-border/60 bg-sidebar/80 backdrop-blur-xl" disableTransition={isResizing}>
          <SidebarHeader className="h-16 justify-center border-b border-sidebar-border/60">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-9 w-9 flex items-center justify-center hover:bg-sidebar-accent rounded-xl transition-all duration-200 focus:outline-none shrink-0 active:scale-95"
                aria-label="切换导航"
              >
                {isCollapsed ? (
                  <img src={LOGO_URL} alt="Logo" className="h-6 w-6 rounded-lg" />
                ) : (
                  <PanelLeft className="h-4 w-4 text-sidebar-foreground/60" />
                )}
              </button>
              {!isCollapsed && (
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={LOGO_URL} alt="深象科技" className="h-7 w-7 rounded-lg shrink-0 shadow-sm" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm text-sidebar-foreground tracking-tight truncate">
                      深象 × OPCS
                    </span>
                    <span className="text-[10px] text-sidebar-foreground/40 truncate">
                      内容运营管理平台
                    </span>
                  </div>
                </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 py-3">
            {menuGroups.map((group) => (
              <SidebarGroup key={group.label} className="py-1">
                <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/30 uppercase tracking-widest px-4 mb-1">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="px-2 gap-0.5">
                    {group.items.map((item) => {
                      const isActive = item.path === "/"
                        ? location === "/"
                        : location.startsWith(item.path);
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton
                            isActive={isActive}
                            onClick={() => setLocation(item.path)}
                            tooltip={item.label}
                            className={`h-9 transition-all duration-200 font-normal text-[13px] rounded-xl ${
                              isActive
                                ? "bg-primary/10 text-primary font-medium shadow-sm shadow-primary/5"
                                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/80"
                            }`}
                          >
                            <item.icon className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${isActive ? "text-primary" : ""}`} />
                            <span>{item.label}</span>
                            {isActive && !isCollapsed && (
                              <ChevronRight className="ml-auto h-3 w-3 text-primary/50" />
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-sidebar-border/60">
            <a
              href="/site"
              className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-sidebar-accent/80 transition-all duration-200 w-full text-left text-sidebar-foreground/60 hover:text-sidebar-foreground group-data-[collapsible=icon]:justify-center mb-1"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span className="text-[13px] group-data-[collapsible=icon]:hidden">访问官网</span>
            </a>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-sidebar-accent/80 transition-all duration-200 w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none active:scale-[0.98]">
                  <Avatar className="h-8 w-8 shrink-0 ring-2 ring-primary/10">
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-[13px] font-medium truncate leading-none text-sidebar-foreground">
                      {user?.name || "用户"}
                    </p>
                    <p className="text-[11px] text-sidebar-foreground/40 truncate mt-1">
                      {user?.email || user?.role || "member"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg shadow-black/8 border-border/50">
                <DropdownMenuItem onClick={() => setLocation("/settings")} className="cursor-pointer rounded-lg">
                  <User className="mr-2 h-4 w-4" />
                  <span>个人设置</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive rounded-lg"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors duration-200 ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b border-border/40 h-14 items-center justify-between glass px-3 sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-xl" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {activeMenuItem?.label ?? "深象 × OPCS"}
                </span>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>
    </>
  );
}
