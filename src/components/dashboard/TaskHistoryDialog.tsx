"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/clients/client";
import { differenceInDays, format } from "date-fns";
import { CheckCircle2, History, TrendingUp, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface TaskCompletion {
  id: string;
  completed_at: string;
  notes: string | null;
}

interface TaskHistoryDialogProps {
  taskId: string;
  taskTitle: string;
  taskStartDate: string;
  frequencyType: string;
  frequencyValue: number;
}

export function TaskHistoryDialog({
  taskId,
  taskTitle,
  taskStartDate,
  frequencyType,
  frequencyValue,
}: TaskHistoryDialogProps) {
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("task_scheduler_task_completions")
      .select("*")
      .eq("task_id", taskId)
      .order("completed_at", { ascending: false });

    if (!error && data) {
      setCompletions(data);
    }
    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open, loadHistory]);

  const calculateStats = () => {
    const startDate = new Date(taskStartDate);
    const today = new Date();
    const daysSinceStart = differenceInDays(today, startDate);

    // Calculate expected completions based on frequency
    let expectedCompletions = 0;
    switch (frequencyType) {
      case "daily":
        expectedCompletions = Math.floor(daysSinceStart / frequencyValue);
        break;
      case "weekly":
        expectedCompletions = Math.floor(daysSinceStart / (frequencyValue * 7));
        break;
      case "monthly":
        expectedCompletions = Math.floor(
          daysSinceStart / (frequencyValue * 30)
        );
        break;
      case "yearly":
        expectedCompletions = Math.floor(
          daysSinceStart / (frequencyValue * 365)
        );
        break;
    }

    const actualCompletions = completions.length;
    const completionRate =
      expectedCompletions > 0
        ? Math.round((actualCompletions / expectedCompletions) * 100)
        : 0;
    const missedTasks = Math.max(0, expectedCompletions - actualCompletions);

    return {
      totalCompletions: actualCompletions,
      expectedCompletions,
      completionRate,
      missedTasks,
    };
  };

  const stats = calculateStats();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History size={16} className="mr-2" />
          View History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{taskTitle}</DialogTitle>
          <DialogDescription>
            Task completion history and statistics
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-medium">Completed</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {stats.totalCompletions}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <TrendingUp size={16} />
                  <span className="text-xs font-medium">Rate</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {stats.completionRate}%
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-700 mb-1">
                  <XCircle size={16} />
                  <span className="text-xs font-medium">Missed</span>
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {stats.missedTasks}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  <History size={16} />
                  <span className="text-xs font-medium">Expected</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {stats.expectedCompletions}
                </div>
              </div>
            </div>

            {/* Completion Badge */}
            <div className="flex items-center justify-center">
              {stats.completionRate >= 80 && (
                <Badge className="bg-green-600 text-white">
                  🏆 Excellent Performance
                </Badge>
              )}
              {stats.completionRate >= 50 && stats.completionRate < 80 && (
                <Badge className="bg-blue-600 text-white">
                  👍 Good Progress
                </Badge>
              )}
              {stats.completionRate < 50 && stats.completionRate > 0 && (
                <Badge className="bg-orange-600 text-white">
                  💪 Keep Going
                </Badge>
              )}
              {stats.completionRate === 0 && (
                <Badge className="bg-gray-600 text-white">
                  🎯 Let&apos;s Start
                </Badge>
              )}
            </div>

            {/* Completion History */}
            <div>
              <h3 className="font-semibold mb-3">Completion History</h3>
              {completions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No completions yet
                </div>
              ) : (
                <div className="space-y-2">
                  {completions.map((completion) => (
                    <div
                      key={completion.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <div>
                          <div className="font-medium">
                            {format(new Date(completion.completed_at), "PPP")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(completion.completed_at), "p")}
                          </div>
                        </div>
                      </div>
                      {completion.notes && (
                        <div className="text-sm text-muted-foreground italic">
                          {completion.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
