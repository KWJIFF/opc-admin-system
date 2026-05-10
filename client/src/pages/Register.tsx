import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, UserPlus } from "lucide-react";
import { Link } from "wouter";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695431/Fb26PagKyopspprUoxxADo/logo-master_f43d4fa5.png";

export default function RegisterPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      window.location.href = "/";
    }
  }, [user]);

  if (user) return null;

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      toast.error("请输入用户名和密码");
      return;
    }
    if (username.trim().length < 2) {
      toast.error("用户名至少 2 个字符");
      return;
    }
    if (password.length < 6) {
      toast.error("密码至少 6 位");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          name: name.trim() || username.trim(),
          email: email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "注册失败");
        setLoading(false);
        return;
      }
      toast.success(data.isFirstUser ? "注册成功！您已成为管理员" : "注册成功！请登录");
      window.location.href = "/login";
    } catch (err) {
      toast.error("注册失败，请稍后重试");
      setLoading(false);
    }
  };

  const inputClass = "h-11 bg-muted/20 border-border/50 rounded-xl text-[14px] placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50/60 via-white to-orange-50/30 p-4">
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
          <div className="flex flex-col items-center mb-8">
            <motion.img
              src={LOGO_URL}
              alt="深象科技"
              className="w-[72px] h-[72px] rounded-[20px] mb-5 shadow-xl shadow-primary/15"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.2 }}
            />
            <h1 className="text-[22px] font-bold text-foreground tracking-tight">
              创建账户
            </h1>
            <p className="text-[13px] text-muted-foreground mt-1.5">
              注册深象 OPCS 管理平台
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6 py-2.5 bg-muted/30 rounded-2xl">
            <UserPlus className="h-4 w-4 text-primary/70" />
            <span className="text-[13px] font-medium text-foreground/70">新用户注册</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-foreground/70">用户名 *</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名（2-50个字符）"
                className={inputClass}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-foreground/70">显示名称</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="您的显示名称（可选）"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-foreground/70">邮箱</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com（可选）"
                className={inputClass}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-foreground/70">密码 *</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码（至少6位）"
                className={inputClass}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-foreground/70">确认密码 *</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                className={inputClass}
                autoComplete="new-password"
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              />
            </div>
          </div>

          <Button
            onClick={handleRegister}
            disabled={loading}
            className="w-full h-12 mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[15px] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 btn-press rounded-xl transition-all duration-200"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {loading ? "注册中..." : "注册"}
          </Button>

          <div className="text-center mt-5">
            <span className="text-[13px] text-muted-foreground">已有账户？</span>
            <Link href="/login" className="text-[13px] text-primary font-medium ml-1 hover:underline">
              立即登录
            </Link>
          </div>

          <p className="text-center text-[11px] text-muted-foreground/40 mt-6 font-medium">
            上海深象科技 · SHENXIANG TECH
          </p>
        </div>
      </motion.div>
    </div>
  );
}
