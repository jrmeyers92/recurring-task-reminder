"use client";

import { snoozeTask } from "@/actions/taskActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDays, format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface SnoozeTaskDialogProps {
  taskId: string;
  taskTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SnoozeTaskDialog({
  taskId,
  taskTitle,
  open,
  onOpenChange,
}: SnoozeTaskDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [customDate, setCustomDate] = useState(
    format(addDays(new Date(), 7), "yyyy-MM-dd")
  );
  const router = useRouter();

  const handleSnooze = (days?: number) => {
    const snoozeUntil = days
      ? format(addDays(new Date(), days), "yyyy-MM-dd")
      : customDate;

    startTransition(async () => {
      const result = await snoozeTask(taskId, snoozeUntil);
      if (result.success) {
        toast.success("Task snoozed", {
          description: `"${taskTitle}" is snoozed until ${format(
            new Date(snoozeUntil),
            "PPP"
          )}`,
        });
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error("Failed to snooze task", {
          description: result.error,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Snooze Task</DialogTitle>
          <DialogDescription>
            Temporarily hide &ldquo;{taskTitle}&rdquo; until a specific date.
            The task will automatically resume after this date.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Quick Snooze</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleSnooze(1)}
                disabled={isPending}
              >
                1 Day
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSnooze(3)}
                disabled={isPending}
              >
                3 Days
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSnooze(7)}
                disabled={isPending}
              >
                1 Week
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSnooze(14)}
                disabled={isPending}
              >
                2 Weeks
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSnooze(30)}
                disabled={isPending}
              >
                1 Month
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSnooze(90)}
                disabled={isPending}
              >
                3 Months
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-date">Custom Date</Label>
            <div className="flex gap-2">
              <Input
                id="custom-date"
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                disabled={isPending}
              />
              <Button
                onClick={() => handleSnooze()}
                disabled={isPending}
                className="shrink-0"
              >
                {isPending ? "Snoozing..." : "Snooze"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
