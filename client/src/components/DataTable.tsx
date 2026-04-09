import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

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
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 h-9 bg-muted/30 border-border/60"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 border-border/60">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            筛选
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`text-left text-xs font-medium text-muted-foreground px-4 py-3 ${col.className || ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-sm text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3 text-sm ${col.className || ""}`}>
                        {col.render ? col.render(row) : String(row[col.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Reusable status badge
export function StatusBadge({ status, map }: { status: string; map: Record<string, { label: string; variant: string }> }) {
  const config = map[status] || { label: status, variant: "bg-gray-100 text-gray-600" };
  return (
    <Badge variant="secondary" className={`${config.variant} border-0 text-[11px] font-medium`}>
      {config.label}
    </Badge>
  );
}
