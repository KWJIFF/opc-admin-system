import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot, Pencil, Upload, Image, Music, Video, FileText, Sparkles,
  Send, RotateCcw, Copy, Check, Loader2, Bold, Italic, List,
  Link2, Quote, Heading2, Heading3, Minus
} from "lucide-react";
import { toast } from "sonner";

/* ── Types ── */
export interface EditorContent {
  title: string;
  body: string;
  summary: string;
  tags: string[];
  coverImage?: string;
}

interface ContentEditorProps {
  initialContent?: Partial<EditorContent>;
  onChange?: (content: EditorContent) => void;
  platform?: string;
}

/* ── Toolbar Button ── */
function ToolbarBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
      title={label}
    >
      {icon}
    </button>
  );
}

/* ── Asset Upload Area ── */
function AssetUploadArea({ type, onUpload }: { type: "image" | "audio" | "video" | "file"; onUpload: () => void }) {
  const config = {
    image: { icon: <Image className="h-5 w-5" />, label: "上传图片", accept: "JPG, PNG, WebP, GIF", color: "text-blue-500 bg-blue-50" },
    audio: { icon: <Music className="h-5 w-5" />, label: "上传音频", accept: "MP3, WAV, AAC", color: "text-purple-500 bg-purple-50" },
    video: { icon: <Video className="h-5 w-5" />, label: "上传视频", accept: "MP4, MOV, WebM", color: "text-rose-500 bg-rose-50" },
    file: { icon: <FileText className="h-5 w-5" />, label: "上传文件", accept: "PDF, DOC, MD, TXT", color: "text-amber-500 bg-amber-50" },
  };
  const c = config[type];

  return (
    <button
      onClick={onUpload}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-border/40 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group"
    >
      <div className={`p-2.5 rounded-xl ${c.color} group-hover:scale-105 transition-transform`}>
        {c.icon}
      </div>
      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{c.label}</span>
      <span className="text-[10px] text-muted-foreground/60">{c.accept}</span>
    </button>
  );
}

/* ── AI Assistant Panel ── */
function AIAssistantPanel({ onGenerate }: { onGenerate: (text: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const quickPrompts = [
    "根据标题生成完整文章",
    "优化现有内容的表达",
    "生成文章摘要",
    "生成社交媒体文案",
    "改写为小红书风格",
    "改写为公众号风格",
    "生成 SEO 标题建议",
    "扩展当前段落",
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onGenerate("AI 生成的内容将在这里显示。实际使用时，这里会调用后端 AI 接口生成内容。");
      toast.success("AI 内容生成完成");
    }, 1500);
  };

  return (
    <div className="space-y-3">
      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-1.5">
        {quickPrompts.map(qp => (
          <button
            key={qp}
            onClick={() => setPrompt(qp)}
            className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-600 text-[11px] font-medium hover:bg-violet-100 transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Prompt Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="描述你想要生成的内容，或选择上方的快捷指令..."
            className="w-full h-20 px-3 py-2.5 text-sm rounded-xl border border-border/40 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              size="sm"
              disabled={!prompt.trim() || isGenerating}
              onClick={handleGenerate}
              className="h-7 px-3 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
            >
              {isGenerating ? (
                <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> 生成中...</>
              ) : (
                <><Sparkles className="h-3 w-3 mr-1" /> 生成</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Content Editor ── */
export default function ContentEditor({ initialContent, onChange, platform }: ContentEditorProps) {
  const [content, setContent] = useState<EditorContent>({
    title: initialContent?.title || "",
    body: initialContent?.body || "",
    summary: initialContent?.summary || "",
    tags: initialContent?.tags || [],
    coverImage: initialContent?.coverImage,
  });
  const [mode, setMode] = useState<"write" | "ai">("write");
  const [tagInput, setTagInput] = useState("");
  const [showAssets, setShowAssets] = useState(false);

  const updateContent = (updates: Partial<EditorContent>) => {
    const newContent = { ...content, ...updates };
    setContent(newContent);
    onChange?.(newContent);
  };

  const addTag = () => {
    if (tagInput.trim() && !content.tags.includes(tagInput.trim())) {
      updateContent({ tags: [...content.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    updateContent({ tags: content.tags.filter(t => t !== tag) });
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode("write")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === "write" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/40"
          }`}
        >
          <Pencil className="h-3.5 w-3.5" /> 手动编辑
        </button>
        <button
          onClick={() => setMode("ai")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === "ai" ? "bg-violet-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted/40"
          }`}
        >
          <Bot className="h-3.5 w-3.5" /> AI 辅助
        </button>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs rounded-lg border-border/50"
          onClick={() => setShowAssets(!showAssets)}
        >
          <Upload className="h-3 w-3 mr-1" /> 素材库
        </Button>
      </div>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {mode === "ai" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-violet-200/60 bg-gradient-to-r from-violet-50/50 to-purple-50/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="h-4 w-4 text-violet-600" />
                  <span className="text-sm font-medium text-violet-700">AI 写作助手</span>
                </div>
                <AIAssistantPanel onGenerate={(text) => updateContent({ body: content.body ? content.body + "\n\n" + text : text })} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset Upload Panel */}
      <AnimatePresence>
        {showAssets && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">上传素材</span>
                  <span className="text-[10px] text-muted-foreground">支持拖拽上传</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <AssetUploadArea type="image" onUpload={() => toast.info("图片上传功能即将上线")} />
                  <AssetUploadArea type="audio" onUpload={() => toast.info("音频上传功能即将上线")} />
                  <AssetUploadArea type="video" onUpload={() => toast.info("视频上传功能即将上线")} />
                  <AssetUploadArea type="file" onUpload={() => toast.info("文件上传功能即将上线")} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <input
        type="text"
        value={content.title}
        onChange={e => updateContent({ title: e.target.value })}
        placeholder="输入标题..."
        className="w-full text-xl font-bold px-0 py-2 bg-transparent border-0 border-b border-border/30 focus:outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground/40"
      />

      {/* Summary */}
      <textarea
        value={content.summary}
        onChange={e => updateContent({ summary: e.target.value })}
        placeholder="输入摘要（可选）..."
        rows={2}
        className="w-full text-sm px-0 py-2 bg-transparent border-0 border-b border-border/20 focus:outline-none focus:border-primary/30 transition-colors resize-none placeholder:text-muted-foreground/40 text-muted-foreground"
      />

      {/* Editor Toolbar */}
      <div className="flex items-center gap-0.5 px-1 py-1 bg-muted/20 rounded-xl border border-border/20">
        <ToolbarBtn icon={<Bold className="h-3.5 w-3.5" />} label="加粗" onClick={() => toast.info("加粗")} />
        <ToolbarBtn icon={<Italic className="h-3.5 w-3.5" />} label="斜体" onClick={() => toast.info("斜体")} />
        <ToolbarBtn icon={<Heading2 className="h-3.5 w-3.5" />} label="标题2" onClick={() => toast.info("标题2")} />
        <ToolbarBtn icon={<Heading3 className="h-3.5 w-3.5" />} label="标题3" onClick={() => toast.info("标题3")} />
        <div className="w-px h-4 bg-border/30 mx-1" />
        <ToolbarBtn icon={<List className="h-3.5 w-3.5" />} label="列表" onClick={() => toast.info("列表")} />
        <ToolbarBtn icon={<Quote className="h-3.5 w-3.5" />} label="引用" onClick={() => toast.info("引用")} />
        <ToolbarBtn icon={<Link2 className="h-3.5 w-3.5" />} label="链接" onClick={() => toast.info("链接")} />
        <ToolbarBtn icon={<Minus className="h-3.5 w-3.5" />} label="分隔线" onClick={() => toast.info("分隔线")} />
        <div className="w-px h-4 bg-border/30 mx-1" />
        <ToolbarBtn icon={<Image className="h-3.5 w-3.5" />} label="插入图片" onClick={() => toast.info("插入图片")} />
        <ToolbarBtn icon={<Video className="h-3.5 w-3.5" />} label="插入视频" onClick={() => toast.info("插入视频")} />
      </div>

      {/* Body Editor */}
      <textarea
        value={content.body}
        onChange={e => updateContent({ body: e.target.value })}
        placeholder="开始撰写内容...&#10;&#10;支持 Markdown 格式，也可以直接粘贴富文本内容。"
        rows={12}
        className="w-full text-[15px] leading-[1.8] px-0 py-3 bg-transparent border-0 focus:outline-none resize-none placeholder:text-muted-foreground/30"
      />

      {/* Tags */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="添加标签，回车确认..."
            className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-border/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
          <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg" onClick={addTag}>
            添加
          </Button>
        </div>
        {content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {content.tags.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-orange-50 text-orange-600 border-0 text-[11px] cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => removeTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
