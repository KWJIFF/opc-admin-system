import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, KeyRound } from "lucide-react";
import { Link } from "wouter";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695431/Fb26PagKyopspprUoxxADo/logo-master_f43d4fa5.png";

export default function LoginPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const utils = trpc.useUtils();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("登录成功");
      await utils.auth.me.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "登录失败，请稍后重试");
      setLoading(false);
    },
  });

  // Redirect if already logged in (via useEffect, not in render)
  useEffect(() => {
    if (user) {
      window.location.href = "/admin";
    }
  }, [user]);

  // If already logged in, show nothing while redirecting
  if (user) {
    return null;
  }

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast.error("请输入账号和密码");
      return;
    }
    setLoading(true);
    loginMutation.mutate({ username: username.trim(), password });
  };

  const inputClass = "h-11 bg-muted/20 border-border/50 rounded-xl text-[14px] placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50/60 via-white to-orange-50/30 p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-amber-100/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[420px]"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/[0.06] border border-white/60 p-8 ring-1 ring-black/[0.03]">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <motion.img
              src={LOGO_URL}
              alt="深象科技"
              className="w-[72px] h-[72px] rounded-[20px] mb-5 shadow-xl shadow-primary/15"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.2 }}
            />
            <h1 className="text-[22px] font-bold text-foreground tracking-tight">
              深象 × OPCS
            </h1>
            <p className="text-[13px] text-muted-foreground mt-1.5">
              内容运营管理平台
            </p>
          </div>

          {/* Login Method Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6 py-2.5 bg-muted/30 rounded-2xl">
            <KeyRound className="h-4 w-4 text-primary/70" />
            <span className="text-[13px] font-medium text-foreground/70">账号密码登录</span>
          </div>

          {/* Account Login Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-foreground/70">账号</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className={inputClass}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-foreground/70">密码</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className={inputClass}
                autoComplete="current-password"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[15px] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 btn-press rounded-xl transition-all duration-200"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {loading ? "登录中..." : "登录"}
          </Button>

          {/* Register Link */}
          <div className="text-center mt-5">
            <span className="text-[13px] text-muted-foreground">还没有账户？</span>
            <Link href="/register" className="text-[13px] text-primary font-medium ml-1 hover:underline">
              立即注册
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-muted-foreground/40 mt-6 font-medium">
            上海深象科技 · SHENXIANG TECH
          </p>
        </div>
      </motion.div>
    </div>
  );
}
