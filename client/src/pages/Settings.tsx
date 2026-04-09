import PageShell from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings2, Save, Puzzle, Wrench, Blocks, RefreshCw, ExternalLink,
  Brain, Database, Cloud, Bell, Shield, Globe, Zap, ArrowRightLeft,
  Package, ChevronRight, CheckCircle2, AlertCircle, Info
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

/* ── Module Registry ── */
const moduleRegistry = [
  {
    id: "signal-collector", name: "信号采集引擎", category: "内容管理",
    description: "从 RSS、API、网页等多种来源自动采集行业信号",
    status: "active" as const, version: "1.2.0", provider: "内置",
    replaceable: true, alternatives: ["自定义 RSS 采集器", "第三方舆情 API"],
  },
  {
    id: "ai-content-gen", name: "AI 内容生成", category: "智能工具",
    description: "基于通义千问大模型的内容生成与辅助写作",
    status: "active" as const, version: "2.0.0", provider: "阿里云·通义千问",
    replaceable: true, alternatives: ["通义千问-Max", "通义千问-Plus", "通义千问-Turbo"],
  },
  {
    id: "ai-review", name: "AI 内容审核", category: "内容管理",
    description: "自动化内容质量评分与合规性检测",
    status: "active" as const, version: "1.1.0", provider: "阿里云·内容安全",
    replaceable: true, alternatives: ["自定义审核规则", "阿里云内容安全 API"],
  },
  {
    id: "multi-publish", name: "多平台发布引擎", category: "分发与运营",
    description: "内容格式适配与多平台分发（半自动/全自动）",
    status: "active" as const, version: "1.0.0", provider: "内置",
    replaceable: true, alternatives: ["有一云 API", "自定义发布适配器"],
  },
  {
    id: "data-insight", name: "数据洞察引擎", category: "智能工具",
    description: "行业趋势分析、竞品监控与关键词追踪",
    status: "active" as const, version: "1.0.0", provider: "内置",
    replaceable: true, alternatives: ["第三方数据 API", "自定义爬虫"],
  },
  {
    id: "workflow-engine", name: "工作流引擎", category: "智能工具",
    description: "自动化工作流编排、定时任务与事件驱动",
    status: "active" as const, version: "1.3.0", provider: "内置",
    replaceable: true, alternatives: ["n8n 集成", "自定义调度器"],
  },
  {
    id: "report-gen", name: "报告生成器", category: "分发与运营",
    description: "自动化周报/月报/专题报告生成",
    status: "active" as const, version: "1.0.0", provider: "内置 + 通义千问",
    replaceable: true, alternatives: ["自定义模板引擎"],
  },
  {
    id: "team-auth", name: "团队认证与权限", category: "系统管理",
    description: "多端登录、角色管理与访问控制",
    status: "active" as const, version: "1.0.0", provider: "内置",
    replaceable: false, alternatives: [],
  },
];

/* ── Tool Adapters ── */
const toolAdapters = [
  {
    id: "llm", name: "大语言模型", icon: <Brain className="h-4 w-4" />,
    current: "通义千问 (qwen-max)", provider: "阿里云",
    status: "connected" as const,
    configFields: [
      { key: "api_key", label: "API Key", type: "password", value: "sk-****" },
      { key: "model", label: "默认模型", type: "text", value: "qwen-max" },
      { key: "endpoint", label: "API 端点", type: "text", value: "https://dashscope.aliyuncs.com/compatible-mode/v1" },
    ],
    note: "仅支持阿里系大模型（通义千问系列）",
  },
  {
    id: "storage", name: "对象存储", icon: <Cloud className="h-4 w-4" />,
    current: "阿里云 OSS", provider: "阿里云",
    status: "connected" as const,
    configFields: [
      { key: "bucket", label: "Bucket", type: "text", value: "opcs-assets" },
      { key: "region", label: "Region", type: "text", value: "cn-hangzhou" },
      { key: "access_key", label: "AccessKey ID", type: "password", value: "LTAI****" },
      { key: "secret_key", label: "AccessKey Secret", type: "password", value: "****" },
    ],
    note: "用于存储媒体资源、模板文件和备份数据",
  },
  {
    id: "database", name: "数据库", icon: <Database className="h-4 w-4" />,
    current: "MySQL 8.0 (阿里云 RDS)", provider: "阿里云",
    status: "connected" as const,
    configFields: [
      { key: "host", label: "主机地址", type: "text", value: "rm-****.mysql.rds.aliyuncs.com" },
      { key: "port", label: "端口", type: "text", value: "3306" },
      { key: "database", label: "数据库名", type: "text", value: "opcs_production" },
    ],
    note: "主数据库，存储所有业务数据",
  },
  {
    id: "cdn", name: "CDN 加速", icon: <Globe className="h-4 w-4" />,
    current: "阿里云 CDN", provider: "阿里云",
    status: "connected" as const,
    configFields: [
      { key: "domain", label: "加速域名", type: "text", value: "cdn.shenxiang.tech" },
    ],
    note: "静态资源和媒体文件加速分发",
  },
  {
    id: "notification", name: "消息通知", icon: <Bell className="h-4 w-4" />,
    current: "阿里云短信 + 邮件推送", provider: "阿里云",
    status: "connected" as const,
    configFields: [
      { key: "sms_sign", label: "短信签名", type: "text", value: "深象科技" },
      { key: "email_sender", label: "发件邮箱", type: "text", value: "noreply@shenxiang.tech" },
    ],
    note: "用于验证码、告警和运营通知",
  },
  {
    id: "security", name: "内容安全", icon: <Shield className="h-4 w-4" />,
    current: "阿里云内容安全", provider: "阿里云",
    status: "standby" as const,
    configFields: [
      { key: "endpoint", label: "服务端点", type: "text", value: "green.cn-hangzhou.aliyuncs.com" },
    ],
    note: "文本/图片内容合规性检测",
  },
];

/* ── Extension Points ── */
const extensionPoints = [
  { id: "custom-source", name: "自定义信号源", description: "接入自定义数据源（API/RSS/爬虫），扩展情报采集范围", status: "available" },
  { id: "custom-template", name: "自定义内容模板", description: "上传和管理各平台的内容模板，支持变量替换和 AI 填充", status: "available" },
  { id: "custom-platform", name: "自定义发布平台", description: "通过适配器接口接入新的发布平台，扩展多平台分发能力", status: "available" },
  { id: "custom-workflow", name: "自定义工作流节点", description: "开发自定义工作流节点，扩展自动化编排能力", status: "coming" },
  { id: "webhook-integration", name: "Webhook 集成", description: "通过 Webhook 与外部系统双向通信，实现事件驱动的集成", status: "available" },
  { id: "plugin-api", name: "插件 API", description: "基于标准化插件 API 开发第三方扩展，热插拔式加载", status: "coming" },
];

const statusColors: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "运行中", color: "text-emerald-700 bg-emerald-50", dot: "bg-emerald-500" },
  inactive: { label: "已停用", color: "text-gray-600 bg-gray-100", dot: "bg-gray-400" },
  connected: { label: "已连接", color: "text-emerald-700 bg-emerald-50", dot: "bg-emerald-500" },
  standby: { label: "待激活", color: "text-amber-700 bg-amber-50", dot: "bg-amber-500" },
  available: { label: "可用", color: "text-blue-700 bg-blue-50", dot: "bg-blue-500" },
  coming: { label: "即将推出", color: "text-gray-600 bg-gray-100", dot: "bg-gray-400" },
};

/* ── Module Card ── */
function ModuleCard({ mod, index }: { mod: typeof moduleRegistry[0]; index: number }) {
  const sc = statusColors[mod.status];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Puzzle className="h-4 w-4 text-primary shrink-0" />
                <h4 className="font-semibold text-sm text-foreground">{mod.name}</h4>
                <Badge variant="secondary" className={`${sc.color} border-0 text-[10px] px-1.5 py-0`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} mr-1 inline-block`} />
                  {sc.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2 pl-6">{mod.description}</p>
              <div className="flex items-center gap-3 pl-6 text-[11px] text-muted-foreground flex-wrap">
                <span>v{mod.version}</span>
                <span>·</span>
                <span>{mod.provider}</span>
                <span>·</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/60">{mod.category}</Badge>
              </div>
              {mod.replaceable && mod.alternatives.length > 0 && (
                <div className="flex items-center gap-1.5 pl-6 mt-2 flex-wrap">
                  <ArrowRightLeft className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-[10px] text-muted-foreground">可替换为：</span>
                  {mod.alternatives.map(alt => (
                    <Badge key={alt} variant="outline" className="text-[10px] px-1.5 py-0 border-dashed border-border/60 text-muted-foreground">{alt}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Switch checked={mod.status === "active"} onCheckedChange={() => toast.info("模块状态切换功能即将上线")} className="scale-90" />
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toast.info("模块配置功能即将上线")}>
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Tool Adapter Card ── */
function ToolAdapterCard({ tool, index }: { tool: typeof toolAdapters[0]; index: number }) {
  const sc = statusColors[tool.status];
  const [showConfig, setShowConfig] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                {tool.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-semibold text-sm text-foreground">{tool.name}</h4>
                  <Badge variant="secondary" className={`${sc.color} border-0 text-[10px] px-1.5 py-0`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} mr-1 inline-block`} />
                    {sc.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{tool.current}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">{tool.note}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-border/60"
                onClick={() => setShowConfig(!showConfig)}
              >
                <Wrench className="h-3 w-3 mr-1" />
                配置
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toast.info("连接测试功能即将上线")}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {showConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-border/30"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tool.configFields.map(field => (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">{field.label}</Label>
                    <Input
                      type={field.type === "password" ? "password" : "text"}
                      defaultValue={field.value}
                      className="h-8 text-xs bg-muted/30 border-border/60 font-mono"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-3 gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs border-border/60" onClick={() => toast.info("连接测试中...")}>
                  测试连接
                </Button>
                <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => toast.success("配置已保存")}>
                  保存
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function SettingsPage() {
  return (
    <PageShell title="系统设置" description="平台配置、模块管理与工具适配" icon={<Settings2 className="h-5 w-5" />}>
      <Tabs defaultValue="general" className="space-y-5">
        <TabsList className="bg-muted/40 p-1 h-auto flex-wrap">
          <TabsTrigger value="general" className="text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2">
            基本设置
          </TabsTrigger>
          <TabsTrigger value="modules" className="text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2">
            模块管理
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2">
            工具配置
          </TabsTrigger>
          <TabsTrigger value="extensions" className="text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2">
            扩展中心
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2">
            通知设置
          </TabsTrigger>
          <TabsTrigger value="backup" className="text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2">
            数据与备份
          </TabsTrigger>
        </TabsList>

        {/* ── General Tab ── */}
        <TabsContent value="general" className="space-y-5">
          <div className="max-w-3xl space-y-5">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">平台信息</CardTitle>
                <CardDescription className="text-xs">基本的平台配置信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">平台名称</Label>
                    <Input defaultValue="深象 OPCS" className="h-9 bg-muted/30 border-border/60" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">管理员邮箱</Label>
                    <Input defaultValue="admin@shenxiang.tech" className="h-9 bg-muted/30 border-border/60" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">网站域名</Label>
                    <Input defaultValue="admin.shenxiang.tech" className="h-9 bg-muted/30 border-border/60" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">备案号</Label>
                    <Input defaultValue="" placeholder="ICP 备案号" className="h-9 bg-muted/30 border-border/60" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">AI 模型配置</CardTitle>
                <CardDescription className="text-xs">所有 AI 能力统一使用阿里系大模型</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/80">本平台所有大模型能力均使用阿里系产品（通义千问系列），不引入其他厂商模型。如需更换模型版本，请在下方配置。</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">通义千问 API Key</Label>
                    <Input type="password" defaultValue="sk-****" className="h-9 bg-muted/30 border-border/60 font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">默认模型</Label>
                    <Input defaultValue="qwen-max" className="h-9 bg-muted/30 border-border/60 font-mono" />
                  </div>
                </div>
                <Separator className="my-1" />
                <div className="space-y-3">
                  {[
                    { label: "AI 内容审核", desc: "内容提交后自动触发 AI 预审", on: true },
                    { label: "AI 选题推荐", desc: "基于信号数据自动推荐选题", on: true },
                    { label: "AI 摘要生成", desc: "自动为长文生成摘要", on: true },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={item.on} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={() => toast.success("设置已保存")}>
                <Save className="h-4 w-4 mr-1.5" />
                保存设置
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── Modules Tab ── */}
        <TabsContent value="modules" className="space-y-5">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2">
            <Blocks className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-800">模块化架构</p>
              <p className="text-[11px] text-blue-700/80">每个功能模块可独立启用/停用/替换，不影响其他模块运行。支持热插拔式的模块管理。</p>
            </div>
          </div>
          <div className="space-y-3">
            {moduleRegistry.map((mod, i) => (
              <ModuleCard key={mod.id} mod={mod} index={i} />
            ))}
          </div>
        </TabsContent>

        {/* ── Tools Tab ── */}
        <TabsContent value="tools" className="space-y-5">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
            <Wrench className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-800">工具适配层</p>
              <p className="text-[11px] text-amber-700/80">底层工具链通过统一适配器接口接入，可灵活切换提供商。所有工具均支持连接测试和配置热更新。</p>
            </div>
          </div>
          <div className="space-y-3">
            {toolAdapters.map((tool, i) => (
              <ToolAdapterCard key={tool.id} tool={tool} index={i} />
            ))}
          </div>
        </TabsContent>

        {/* ── Extensions Tab ── */}
        <TabsContent value="extensions" className="space-y-5">
          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 flex items-start gap-2">
            <Package className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-purple-800">扩展中心</p>
              <p className="text-[11px] text-purple-700/80">通过标准化扩展点接入新功能，无需修改核心代码。新模块可像插件一样快速加载。</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {extensionPoints.map((ext, i) => {
              const sc = statusColors[ext.status];
              return (
                <motion.div key={ext.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="border-border/50 shadow-sm hover:shadow-md transition-all h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary shrink-0" />
                          <h4 className="font-semibold text-sm text-foreground">{ext.name}</h4>
                        </div>
                        <Badge variant="secondary" className={`${sc.color} border-0 text-[10px] px-1.5 py-0 shrink-0`}>
                          {sc.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 pl-6">{ext.description}</p>
                      <div className="pl-6">
                        {ext.status === "available" ? (
                          <Button variant="outline" size="sm" className="h-7 text-xs border-border/60" onClick={() => toast.info("扩展配置功能即将上线")}>
                            配置启用 <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="h-7 text-xs border-border/60 opacity-50" disabled>
                            开发中
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Notifications Tab ── */}
        <TabsContent value="notifications" className="space-y-5">
          <div className="max-w-3xl">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">通知设置</CardTitle>
                <CardDescription className="text-xs">配置各类通知的触发条件和推送方式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "发布成功通知", desc: "内容发布成功后发送通知", on: true },
                  { label: "审核提醒", desc: "有新内容待审核时发送提醒", on: true },
                  { label: "系统异常告警", desc: "系统出现异常时立即告警", on: true },
                  { label: "周报自动推送", desc: "每周一自动推送运营周报", on: false },
                  { label: "信号采集完成", desc: "批量信号采集完成后通知", on: true },
                  { label: "工作流失败告警", desc: "工作流执行失败时立即告警", on: true },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.on} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Backup Tab ── */}
        <TabsContent value="backup" className="space-y-5">
          <div className="max-w-3xl">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">数据与备份</CardTitle>
                <CardDescription className="text-xs">数据库备份策略和日志保留配置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium text-foreground">自动备份</p>
                    <p className="text-[11px] text-muted-foreground">每日凌晨 3:00 自动备份数据库到阿里云 OSS</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium text-foreground">操作日志保留天数</p>
                    <p className="text-[11px] text-muted-foreground">超过保留期的日志将自动清理</p>
                  </div>
                  <Input defaultValue="90" className="h-8 w-20 bg-muted/30 border-border/60 text-center text-sm" />
                </div>
                <Separator className="my-1" />
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="h-8 text-xs border-border/60" onClick={() => toast.info("手动备份功能即将上线")}>
                    <Database className="h-3.5 w-3.5 mr-1.5" />
                    立即备份
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs border-border/60" onClick={() => toast.info("数据导出功能即将上线")}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    导出数据
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
