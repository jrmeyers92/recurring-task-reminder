"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/clients/client";
import { differenceInDays, format } from "date-fns";
import {
  CheckCircle2,
  History,
  Plus,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
  userId: string;
  dayOfMonth?: number | null;
}

export function TaskHistoryDialog({
  taskId,
  taskTitle,
  taskStartDate,
  frequencyType,
  frequencyValue,
  userId,
}: TaskHistoryDialogProps) {
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingCompletion, setAddingCompletion] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [completionToDelete, setCompletionToDelete] =
    useState<TaskCompletion | null>(null);

  // Form state
  const [completionDate, setCompletionDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [completionTime, setCompletionTime] = useState(
    format(new Date(), "HH:mm")
  );
  const [notes, setNotes] = useState("");

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

  const handleAddCompletion = async () => {
    setAddingCompletion(true);
    const supabase = createClient();

    // Combine date and time
    const completedAt = new Date(
      `${completionDate}T${completionTime}`
    ).toISOString();

    const { error } = await supabase
      .from("task_scheduler_task_completions")
      .insert({
        task_id: taskId,
        user_id: userId,
        completed_at: completedAt,
        notes: notes.trim() || null,
      });

    if (error) {
      toast.error("Failed to add completion", {
        description: error.message,
      });
      setAddingCompletion(false);
      return;
    }

    // Calculate the next due date based on this completion
    const { data: nextDueData, error: calcError } = await supabase.rpc(
      "task_scheduler_calculate_next_due_date",
      {
        p_last_completed: completedAt,
        p_frequency_type: frequencyType,
        p_frequency_value: frequencyValue,
        p_day_of_month: null,
      }
    );

    if (calcError) {
      toast.error("Failed to calculate next due date", {
        description: calcError.message,
      });
      setAddingCompletion(false);
      return;
    }

    // Update the task with new next_due_date and last_completed_at
    const { error: updateError } = await supabase
      .from("task_scheduler_tasks")
      .update({
        last_completed_at: completedAt,
        next_due_date: nextDueData,
      })
      .eq("id", taskId);

    if (updateError) {
      toast.error("Failed to update task", {
        description: updateError.message,
      });
      setAddingCompletion(false);
      return;
    }

    toast.success("Completion added", {
      description:
        "Your past completion has been recorded and the task has been rescheduled.",
    });

    setShowAddForm(false);
    setNotes("");
    setCompletionDate(format(new Date(), "yyyy-MM-dd"));
    setCompletionTime(format(new Date(), "HH:mm"));
    loadHistory();

    // Refresh the page to update the dashboard
    window.location.reload();

    setAddingCompletion(false);
  };
  const handleDeleteCompletion = async () => {
    if (!completionToDelete) return;

    setDeletingId(completionToDelete.id);
    const supabase = createClient();

    const { error } = await supabase
      .from("task_scheduler_task_completions")
      .delete()
      .eq("id", completionToDelete.id);

    if (error) {
      toast.error("Failed to delete completion", {
        description: error.message,
      });
    } else {
      toast.success("Completion deleted", {
        description: "The completion record has been removed.",
      });
      loadHistory();
    }

    setDeletingId(null);
    setShowDeleteDialog(false);
    setCompletionToDelete(null);
  };

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
    <>
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

              {/* Add Past Completion */}
              <div className="border-t pt-4">
                {!showAddForm ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Past Completion
                  </Button>
                ) : (
                  <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Add Past Completion</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="completion-date">Date</Label>
                        <Input
                          id="completion-date"
                          type="date"
                          value={completionDate}
                          onChange={(e) => setCompletionDate(e.target.value)}
                          max={format(new Date(), "yyyy-MM-dd")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="completion-time">Time</Label>
                        <Input
                          id="completion-time"
                          type="time"
                          value={completionTime}
                          onChange={(e) => setCompletionTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes about this completion..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleAddCompletion}
                      disabled={addingCompletion}
                      className="w-full"
                    >
                      {addingCompletion ? "Adding..." : "Add Completion"}
                    </Button>
                  </div>
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
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group"
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
                        <div className="flex items-center gap-2">
                          {completion.notes && (
                            <div className="text-sm text-muted-foreground italic max-w-xs truncate">
                              {completion.notes}
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setCompletionToDelete(completion);
                              setShowDeleteDialog(true);
                            }}
                            disabled={deletingId === completion.id}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Completion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this completion record from{" "}
              {completionToDelete &&
                format(new Date(completionToDelete.completed_at), "PPP 'at' p")}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompletion}
              disabled={!!deletingId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
