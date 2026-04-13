import { useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Smartphone, Mail, KeyRound } from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695431/Fb26PagKyopspprUoxxADo/logo-master_f43d4fa5.png";

type LoginMethod = "account" | "phone" | "email";

const methodConfig = [
  { key: "account" as const, label: "账号登录", icon: KeyRound },
  { key: "phone" as const, label: "手机登录", icon: Smartphone },
  { key: "email" as const, label: "邮箱登录", icon: Mail },
];

export default function LoginPage() {
  const { user } = useAuth();
  const [method, setMethod] = useState<LoginMethod>("account");
  const [loading, setLoading] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Account fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Phone fields
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");

  // Email fields
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");

  // If already logged in, redirect
  if (user) {
    window.location.href = "/";
    return null;
  }

  const startCountdown = useCallback(() => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendCode = async (type: "phone" | "email") => {
    const target = type === "phone" ? phone : email;
    if (!target.trim()) {
      toast.error(type === "phone" ? "请输入手机号" : "请输入邮箱地址");
      return;
    }
    setCodeSending(true);
    // Simulate sending code - in production this would call a real API
    await new Promise((r) => setTimeout(r, 1000));
    setCodeSending(false);
    startCountdown();
    toast.success(`验证码已发送至 ${target}`);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      // For now, redirect to OAuth login
      // In production, each method would have its own API endpoint
      if (method === "account") {
        if (!username.trim() || !password.trim()) {
          toast.error("请输入账号和密码");
          setLoading(false);
          return;
        }
      } else if (method === "phone") {
        if (!phone.trim() || phoneCode.length < 6) {
          toast.error("请输入手机号和完整验证码");
          setLoading(false);
          return;
        }
      } else {
        if (!email.trim() || emailCode.length < 6) {
          toast.error("请输入邮箱和完整验证码");
          setLoading(false);
          return;
        }
      }
      // Redirect to Manus OAuth for actual authentication
      window.location.href = getLoginUrl();
    } catch {
      toast.error("登录失败，请稍后重试");
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 16, filter: "blur(4px)" },
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -16, filter: "blur(4px)" },
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

          {/* Method Tabs */}
          <div className="flex bg-muted/40 rounded-2xl p-1 mb-6 gap-0.5">
            {methodConfig.map((m) => (
              <button
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-[12px] font-medium transition-all duration-300 ${
                  method === m.key
                    ? "bg-white text-foreground shadow-sm shadow-black/[0.06] ring-1 ring-black/[0.04]"
                    : "text-muted-foreground hover:text-foreground/70"
                }`}
              >
                <m.icon className="h-3.5 w-3.5" />
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={method}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {method === "account" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-foreground/70">账号</Label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="请输入用户名"
                      className={inputClass}
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
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                  </div>
                </div>
              )}

              {method === "phone" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-foreground/70">手机号</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3.5 bg-muted/30 border border-border/50 rounded-xl text-[13px] text-muted-foreground shrink-0 font-medium">
                        +86
                      </div>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="请输入手机号"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-foreground/70">验证码</Label>
                    <div className="flex gap-3 items-center">
                      <InputOTP maxLength={6} value={phoneCode} onChange={setPhoneCode}>
                        <InputOTPGroup>
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <InputOTPSlot key={i} index={i} className="h-11 w-10 border-border/50 rounded-lg" />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendCode("phone")}
                        disabled={countdown > 0 || codeSending}
                        className="shrink-0 text-[12px] h-11 px-3.5 border-border/50 rounded-xl btn-press"
                      >
                        {codeSending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : countdown > 0 ? (
                          `${countdown}s`
                        ) : (
                          "获取验证码"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {method === "email" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-foreground/70">邮箱</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="请输入邮箱地址"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-foreground/70">验证码</Label>
                    <div className="flex gap-3 items-center">
                      <InputOTP maxLength={6} value={emailCode} onChange={setEmailCode}>
                        <InputOTPGroup>
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <InputOTPSlot key={i} index={i} className="h-11 w-10 border-border/50 rounded-lg" />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendCode("email")}
                        disabled={countdown > 0 || codeSending}
                        className="shrink-0 text-[12px] h-11 px-3.5 border-border/50 rounded-xl btn-press"
                      >
                        {codeSending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : countdown > 0 ? (
                          `${countdown}s`
                        ) : (
                          "获取验证码"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

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

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-[11px] text-muted-foreground/50 font-medium">或</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* OAuth Login */}
          <Button
            variant="outline"
            onClick={() => { window.location.href = getLoginUrl(); }}
            className="w-full h-11 border-border/50 text-foreground/60 hover:text-foreground hover:bg-muted/30 rounded-xl btn-press text-[13px]"
          >
            使用 Manus 账号登录
          </Button>

          {/* Footer */}
          <p className="text-center text-[11px] text-muted-foreground/40 mt-8 font-medium">
            上海深象科技 · SHENXIANG TECH
          </p>
        </div>
      </motion.div>
    </div>
  );
}
