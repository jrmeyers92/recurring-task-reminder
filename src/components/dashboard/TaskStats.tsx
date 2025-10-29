"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskStatsProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  variant: "destructive" | "primary" | "success";
}

export function TaskStats({ title, count, icon, variant }: TaskStatsProps) {
  const variantStyles = {
    destructive: "border-destructive/50 bg-destructive/5",
    primary: "border-primary/50 bg-primary/5",
    success: "border-green-500/50 bg-green-50",
  };

  return (
    <Card className={variantStyles[variant]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {count === 1 ? "task" : "tasks"}
        </p>
      </CardContent>
    </Card>
  );
}
