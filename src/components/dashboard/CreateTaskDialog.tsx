"use client";

import { createTask } from "@/actions/taskActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Constants } from "@/types/database.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  frequency_type: z.enum(Constants.public.Enums.frequency_type),
  frequency_value: z.number().min(1).max(365),
  day_of_month: z.union([z.number().min(1).max(31), z.null()]).optional(),
  start_date: z.string().min(1, "Start date is required"),
  notify_via: z.enum(Constants.public.Enums.notify_method),
  category: z.enum(Constants.public.Enums.task_category),
  reminder_lead_time_days: z
    .union([z.number().min(0).max(30), z.null()])
    .optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
}: CreateTaskDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      frequency_type: "weekly",
      frequency_value: 1,
      day_of_month: null,
      start_date: new Date().toISOString().split("T")[0],
      notify_via: "email",
      category: "other",
      reminder_lead_time_days: null,
    },
  });

  const frequencyType = form.watch("frequency_type");

  const onSubmit = (values: TaskFormValues) => {
    startTransition(async () => {
      const result = await createTask(values);
      if (result.success) {
        toast.success("Task created!", {
          description: "Your recurring task has been created successfully.",
        });
        form.reset();
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error("Failed to create task", {
          description: result.error,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Set up a recurring task and we&apos;ll remind you when it&apos;s
            due.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Change air filter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any details about this task..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="home">🏠 Home</SelectItem>
                      <SelectItem value="vehicle">🚗 Vehicle</SelectItem>
                      <SelectItem value="finance">💰 Finance</SelectItem>
                      <SelectItem value="health">🏥 Health</SelectItem>
                      <SelectItem value="pet">🐾 Pet</SelectItem>
                      <SelectItem value="garden">🌱 Garden</SelectItem>
                      <SelectItem value="appliance">🔧 Appliance</SelectItem>
                      <SelectItem value="insurance">🛡️ Insurance</SelectItem>
                      <SelectItem value="subscription">
                        📱 Subscription
                      </SelectItem>
                      <SelectItem value="maintenance">
                        ⚙️ Maintenance
                      </SelectItem>
                      <SelectItem value="other">📋 Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Every</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Repeat every {field.value} {frequencyType}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {frequencyType === "monthly" && (
              <FormField
                control={form.control}
                name="day_of_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Month (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="e.g., 15 for the 15th of each month"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to repeat relative to completion date
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    When should this task first be due?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reminder_lead_time_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remind Me Early (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      placeholder="e.g., 3 days before due date"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Get notified X days before the task is due
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notify_via"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notification Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Email only</SelectItem>
                      <SelectItem value="sms">SMS only</SelectItem>
                      <SelectItem value="both">Both Email and SMS</SelectItem>
                      <SelectItem value="none">
                        No automated notifications
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
