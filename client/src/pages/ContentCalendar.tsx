import PageShell from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const eventColors: Record<string, string> = {
  publish: "bg-emerald-500",
  review: "bg-blue-500",
  meeting: "bg-purple-500",
  deadline: "bg-red-500",
  other: "bg-gray-500",
};

const eventLabels: Record<string, string> = {
  publish: "发布",
  review: "审核",
  meeting: "会议",
  deadline: "截止",
  other: "其他",
};

const mockEvents = [
  { id: 1, title: "发布周报 Vol.15", eventType: "publish", platform: "微信公众号", day: 9 },
  { id: 2, title: "审核趋势报告", eventType: "review", platform: "", day: 10 },
  { id: 3, title: "小红书内容排期", eventType: "publish", platform: "小红书", day: 11 },
  { id: 4, title: "季度报告截止", eventType: "deadline", platform: "", day: 12 },
  { id: 5, title: "内容策略会议", eventType: "meeting", platform: "", day: 14 },
  { id: 6, title: "B站视频发布", eventType: "publish", platform: "B站", day: 15 },
  { id: 7, title: "知乎专栏更新", eventType: "publish", platform: "知乎", day: 16 },
  { id: 8, title: "审核合规白皮书", eventType: "review", platform: "", day: 18 },
  { id: 9, title: "公众号推文", eventType: "publish", platform: "微信公众号", day: 20 },
  { id: 10, title: "月度复盘会", eventType: "meeting", platform: "", day: 25 },
];

const daysInMonth = 30;
const firstDayOffset = 2; // April 2026 starts on Wednesday (0=Sun)

export default function ContentCalendar() {
  const [currentMonth] = useState("2026年4月");

  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOffset }, (_, i) => i);

  return (
    <PageShell
      title="内容日历"
      description="可视化管理内容发布排期"
      icon={<Calendar className="h-5 w-5" />}
      action={{ label: "新建排期", onClick: () => toast.info("新建排期功能即将上线") }}
    >
      <Card className="card-elevated border-border/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{currentMonth}</CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-border/30">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-3 border-border/30 text-xs">
                今天
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-border/30">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex gap-4 mb-4">
            {Object.entries(eventLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${eventColors[key]}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border/40 rounded-lg overflow-hidden">
            {dayNames.map((d) => (
              <div key={d} className="bg-muted/30 py-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
            {paddingDays.map((i) => (
              <div key={`pad-${i}`} className="bg-background min-h-[100px] p-2" />
            ))}
            {days.map((day) => {
              const dayEvents = mockEvents.filter((e) => e.day === day);
              const isToday = day === 9;
              return (
                <div
                  key={day}
                  className={`bg-background min-h-[100px] p-2 hover:bg-muted/20 transition-colors ${
                    isToday ? "ring-2 ring-primary/30 ring-inset" : ""
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? "text-primary font-bold" : "text-foreground/70"}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-muted/25 hover:bg-muted/60 transition-colors cursor-pointer truncate"
                        onClick={() => toast.info(`${event.title}`)}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${eventColors[event.eventType]}`} />
                        <span className="truncate text-foreground/80">{event.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
