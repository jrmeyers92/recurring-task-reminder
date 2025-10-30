"use client";

import {
  completeTask,
  deleteTask,
  pauseTask,
  resumeTask,
  unsnoozeTask,
} from "@/actions/taskActions";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/types/database.types";
import { format, formatDistanceToNow, isPast } from "date-fns";
import {
  Bed,
  Bell,
  Calendar,
  CheckCircle2,
  Mail,
  MessageSquare,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { EditTaskDialog } from "./EditTaskDialog";
import { SnoozeTaskDialog } from "./SnoozeTaskDialog";
import { TaskHistoryDialog } from "./TaskHistoryDialog";

interface TaskCardProps {
  task: Task;
  variant: "overdue" | "today" | "upcoming";
}

const categoryIcons: Record<string, string> = {
  home: "🏠",
  vehicle: "🚗",
  finance: "💰",
  health: "🏥",
  pet: "🐾",
  garden: "🌱",
  appliance: "🔧",
  insurance: "🛡️",
  subscription: "📱",
  maintenance: "⚙️",
  other: "📋",
};

export function TaskCard({ task, variant }: TaskCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSnoozeDialog, setShowSnoozeDialog] = useState(false);
  const router = useRouter();

  const dueDate = new Date(task.next_due_date);
  const formattedDate = formatDistanceToNow(dueDate, { addSuffix: true });

  const isSnoozed = !!(
    task.snoozed_until && !isPast(new Date(task.snoozed_until))
  );
  const isPaused = !!task.paused;

  const getFrequencyText = () => {
    const { frequency_type, frequency_value, days_of_week } = task;
    const singular = frequency_value === 1;

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    switch (frequency_type) {
      case "daily":
        return singular ? "Daily" : `Every ${frequency_value} days`;
      case "weekly":
        const weekText = singular ? "Weekly" : `Every ${frequency_value} weeks`;
        if (days_of_week && days_of_week.length > 0) {
          const sortedDays = [...days_of_week].sort((a, b) => a - b);
          const dayText = sortedDays.map((d) => dayNames[d]).join(", ");
          return `${weekText} on ${dayText}`;
        }
        return weekText;
      case "monthly":
        return singular ? "Monthly" : `Every ${frequency_value} months`;
      case "yearly":
        return singular ? "Yearly" : `Every ${frequency_value} years`;
      default:
        return "";
    }
  };

  const getNotificationIcon = () => {
    switch (task.notify_via) {
      case "email":
        return <Mail size={14} />;
      case "sms":
        return <MessageSquare size={14} />;
      case "both":
        return <Bell size={14} />;
      default:
        return <Bell size={14} />;
    }
  };

  const handleComplete = () => {
    startTransition(async () => {
      const result = await completeTask(task.id);
      if (result.success) {
        toast.success("Task completed!", {
          description: "Your task has been marked as complete and rescheduled.",
        });
        router.refresh();
      } else {
        toast.error("Failed to complete task", {
          description: result.error,
        });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTask(task.id);
      if (result.success) {
        toast.success("Task deleted", {
          description: "Your task has been permanently deleted.",
        });
        setShowDeleteDialog(false);
        router.refresh();
      } else {
        toast.error("Failed to delete task", {
          description: result.error,
        });
      }
    });
  };

  const handlePause = () => {
    startTransition(async () => {
      const result = await pauseTask(task.id);
      if (result.success) {
        toast.success("Task paused", {
          description: "This task is now paused and won't send notifications.",
        });
        router.refresh();
      } else {
        toast.error("Failed to pause task", {
          description: result.error,
        });
      }
    });
  };

  const handleResume = () => {
    startTransition(async () => {
      const result = await resumeTask(task.id);
      if (result.success) {
        toast.success("Task resumed", {
          description: "This task is now active again.",
        });
        router.refresh();
      } else {
        toast.error("Failed to resume task", {
          description: result.error,
        });
      }
    });
  };

  const handleUnsnooze = () => {
    startTransition(async () => {
      const result = await unsnoozeTask(task.id);
      if (result.success) {
        toast.success("Task unsnoozed", {
          description: "This task is now active again.",
        });
        router.refresh();
      } else {
        toast.error("Failed to unsnooze task", {
          description: result.error,
        });
      }
    });
  };

  const variantStyles = {
    overdue: "border-destructive/50 bg-destructive/5",
    today: "border-primary/50 bg-primary/5",
    upcoming: "border-border",
  };

  return (
    <>
      <Card
        className={`${variantStyles[variant]} ${
          isPaused || isSnoozed ? "opacity-60" : ""
        }`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {task.category && (
                  <span className="text-lg">
                    {categoryIcons[task.category] || "📋"}
                  </span>
                )}
                <CardTitle className="text-lg">{task.title}</CardTitle>
                {isPaused && (
                  <Badge variant="secondary" className="ml-2">
                    <Pause size={12} className="mr-1" />
                    Paused
                  </Badge>
                )}
                {isSnoozed && (
                  <Badge variant="secondary" className="ml-2">
                    <Bed size={12} className="mr-1" />
                    Snoozed
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1">
                {task.description || "No description"}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Pencil size={16} className="mr-2" />
                  Edit
                </DropdownMenuItem>

                {isSnoozed ? (
                  <DropdownMenuItem
                    onClick={handleUnsnooze}
                    disabled={isPending}
                  >
                    <Play size={16} className="mr-2" />
                    Unsnooze
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setShowSnoozeDialog(true)}>
                    <Bed size={16} className="mr-2" />
                    Snooze
                  </DropdownMenuItem>
                )}

                {isPaused ? (
                  <DropdownMenuItem onClick={handleResume} disabled={isPending}>
                    <Play size={16} className="mr-2" />
                    Resume
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handlePause} disabled={isPending}>
                    <Pause size={16} className="mr-2" />
                    Pause
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                  disabled={isPending}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={14} />
            <span>Due {formattedDate}</span>
            {isSnoozed && (
              <span className="text-xs">
                (Snoozed until {format(new Date(task.snoozed_until!), "PP")})
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {task.category && (
              <Badge variant="secondary" className="text-xs capitalize">
                {task.category}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {getFrequencyText()}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs flex items-center gap-1"
            >
              {getNotificationIcon()}
              {task.notify_via}
            </Badge>
            {task.reminder_lead_time_days &&
              task.reminder_lead_time_days > 0 && (
                <Badge variant="outline" className="text-xs">
                  ⏰ {task.reminder_lead_time_days}d early
                </Badge>
              )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            onClick={handleComplete}
            disabled={isPending || isPaused || isSnoozed}
            className="flex-1"
            variant={variant === "overdue" ? "destructive" : "default"}
          >
            <CheckCircle2 size={16} className="mr-2" />
            {isPending ? "Completing..." : "Mark Complete"}
          </Button>
          <TaskHistoryDialog
            taskId={task.id}
            taskTitle={task.title}
            taskStartDate={task.start_date}
            frequencyType={task.frequency_type}
            frequencyValue={task.frequency_value}
            userId={task.user_id}
            dayOfMonth={task.day_of_month}
          />
        </CardFooter>
      </Card>

      <EditTaskDialog
        task={task}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <SnoozeTaskDialog
        taskId={task.id}
        taskTitle={task.title}
        open={showSnoozeDialog}
        onOpenChange={setShowSnoozeDialog}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{task.title}&rdquo;? This
              action cannot be undone and will permanently delete this task and
              all its completion history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete Task"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
