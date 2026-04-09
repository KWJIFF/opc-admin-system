import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Inbox } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: string;
  emptyMessage?: string;
}

const rowVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchPlaceholder = "搜索...",
  searchKey = "title",
  emptyMessage = "暂无数据",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((row) => {
    if (!search.trim()) return true;
    const val = String(row[searchKey] || "").toLowerCase();
    return val.includes(search.toLowerCase());
  });

  return (
    <Card className="card-elevated border-border/40 overflow-hidden">
      <CardContent className="p-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-border/40 bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 h-9 bg-background/80 border-border/50 rounded-lg text-[13px] placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 border-border/50 rounded-lg text-[13px] hover:bg-muted/60 btn-press">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            筛选
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40 bg-muted/10">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`text-left text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-4 py-3 ${col.className || ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-2xl bg-muted/40">
                        <Inbox className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm text-muted-foreground/60">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <motion.tr
                    key={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/20 last:border-0 hover:bg-primary/[0.02] transition-colors duration-150 group"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3.5 text-[13px] ${col.className || ""}`}>
                        {col.render ? col.render(row) : String(row[col.key] ?? "-")}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Reusable status badge with refined styling
export function StatusBadge({ status, map }: { status: string; map: Record<string, { label: string; variant: string }> }) {
  const config = map[status] || { label: status, variant: "bg-gray-100 text-gray-600" };
  return (
    <Badge variant="secondary" className={`${config.variant} border-0 text-[11px] font-medium rounded-md px-2 py-0.5`}>
      {config.label}
    </Badge>
  );
}
