import { useState } from "react";
import PageShell from "@/components/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, CheckCircle2, Clock, XCircle, Trash2, Eye, User, ThumbsUp, Flag } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "待审核", color: "bg-amber-100 text-amber-700" },
  approved: { label: "已通过", color: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "已拒绝", color: "bg-red-100 text-red-700" },
  spam: { label: "垃圾评论", color: "bg-gray-100 text-gray-600" },
};

const mockComments = [
  { id: 1, articleId: 601, articleTitle: "2026年一人公司趋势报告", authorName: "创业小白", authorEmail: "test@example.com", content: "这篇文章写得太好了！特别是关于 AI 工具的部分，给了我很多启发。请问有推荐的 AI 写作工具吗？", status: "pending", createdAt: "2026-04-10 14:30", likes: 5 },
  { id: 2, articleId: 602, articleTitle: "AI 辅助内容生产实践指南", authorName: "独立开发者", content: "实操性很强的文章，已经按照步骤试了一遍，效果确实不错。期待更多这样的干货内容！", status: "approved", createdAt: "2026-04-10 12:15", likes: 12 },
  { id: 3, articleId: 603, articleTitle: "小红书爆款标题公式解析", authorName: "内容运营", content: "公式总结得很到位，但是我觉得还可以加上一些情绪化标题的分析，比如「震惊」「绝了」这类。", status: "approved", createdAt: "2026-04-09 18:00", likes: 8 },
  { id: 4, articleId: 601, articleTitle: "2026年一人公司趋势报告", authorName: "匿名用户", content: "广告广告广告，加微信xxxxx", status: "spam", createdAt: "2026-04-10 15:00", likes: 0 },
  { id: 5, articleId: 604, articleTitle: "创业者工具箱推荐", authorName: "工具控", content: "Notion + Cursor + Claude 这个组合确实很强，我自己也在用。不过建议加上 Midjourney 用于视觉内容创作。", status: "pending", createdAt: "2026-04-10 10:45", likes: 3 },
  { id: 6, articleId: 602, articleTitle: "AI 辅助内容生产实践指南", authorName: "自媒体人", content: "请问这个 AI 写作流程适用于视频脚本吗？我主要做抖音短视频。", status: "pending", createdAt: "2026-04-10 09:20", likes: 2 },
];

function CommentStats() {
  const stats = [
    { label: "总评论", value: mockComments.length, icon: <MessageSquare className="h-4 w-4" />, color: "text-blue-600" },
    { label: "待审核", value: mockComments.filter(c => c.status === "pending").length, icon: <Clock className="h-4 w-4" />, color: "text-amber-600" },
    { label: "已通过", value: mockComments.filter(c => c.status === "approved").length, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-600" },
    { label: "垃圾评论", value: mockComments.filter(c => c.status === "spam").length, icon: <Flag className="h-4 w-4" />, color: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="card-elevated border-border/30 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={s.color}>{s.icon}</span>
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold tracking-tight">{s.value}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function CommentCard({ comment, index }: { comment: typeof mockComments[0]; index: number }) {
  const sc = statusConfig[comment.status] || { label: comment.status, color: "bg-gray-100 text-gray-600" };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Card className="card-elevated border-border/30 rounded-2xl hover:shadow-md transition-all duration-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{comment.authorName}</p>
                  <Badge variant="secondary" className={`${sc.color} border-0 text-[10px]`}>{sc.label}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{comment.createdAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <ThumbsUp className="h-3 w-3" />
              <span className="text-[10px]">{comment.likes}</span>
            </div>
          </div>

          <div className="bg-muted/20 rounded-xl px-3 py-2 mb-3">
            <p className="text-[10px] text-muted-foreground mb-0.5">评论文章</p>
            <p className="text-xs font-medium text-foreground">{comment.articleTitle}</p>
          </div>

          <p className="text-sm text-foreground leading-relaxed mb-3">{comment.content}</p>

          <div className="flex items-center gap-2 pt-2 border-t border-border/20">
            {comment.status === "pending" && (
              <>
                <Button size="sm" className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white btn-press" onClick={() => toast.success("已通过")}>
                  <CheckCircle2 className="h-3 w-3 mr-1" />通过
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg border-border/50 btn-press" onClick={() => toast.info("已拒绝")}>
                  <XCircle className="h-3 w-3 mr-1" />拒绝
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs rounded-lg text-red-500 hover:text-red-600 btn-press" onClick={() => toast.info("已标记为垃圾评论")}>
                  <Flag className="h-3 w-3 mr-1" />垃圾
                </Button>
              </>
            )}
            {comment.status === "approved" && (
              <Button size="sm" variant="ghost" className="h-7 text-xs rounded-lg btn-press" onClick={() => toast.info("回复功能即将上线")}>
                <MessageSquare className="h-3 w-3 mr-1" />回复
              </Button>
            )}
            <div className="flex-1" />
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg btn-press" onClick={() => toast.info("查看文章")}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg text-red-500 hover:text-red-600 btn-press" onClick={() => toast.info("已删除")}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Comments() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredComments = activeTab === "all"
    ? mockComments
    : mockComments.filter(c => c.status === activeTab);

  return (
    <PageShell
      title="评论管理"
      description="管理前台文章评论，审核、回复和处理用户互动"
      icon={<MessageSquare className="h-5 w-5" />}
    >
      <CommentStats />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 mt-5">
        <TabsList className="bg-muted/30 p-1 h-auto rounded-xl">
          <TabsTrigger value="all" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">全部</TabsTrigger>
          <TabsTrigger value="pending" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">
            待审核 <Badge variant="secondary" className="ml-1.5 bg-amber-100 text-amber-700 border-0 text-[10px]">{mockComments.filter(c => c.status === "pending").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">已通过</TabsTrigger>
          <TabsTrigger value="rejected" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">已拒绝</TabsTrigger>
          <TabsTrigger value="spam" className="text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-medium">垃圾评论</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3">
          {filteredComments.length === 0 ? (
            <Card className="border-border/30 rounded-2xl">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">暂无评论</p>
              </CardContent>
            </Card>
          ) : (
            filteredComments.map((comment, i) => (
              <CommentCard key={comment.id} comment={comment} index={i} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
