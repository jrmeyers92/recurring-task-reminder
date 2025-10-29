"use server";

import { createAdminClient } from "@/lib/supabase/clients/admin";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type ActionResponse = {
  success: boolean;
  error?: string;
};

export async function createTask(taskData: {
  title: string;
  description?: string;
  frequency_type: string;
  frequency_value: number;
  day_of_month?: number | null;
  start_date: string;
  notify_via: string;
  category: string;
  reminder_lead_time_days?: number | null;
}): Promise<ActionResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createAdminClient();

    // Calculate next_due_date (same as start_date initially)
    const next_due_date = taskData.start_date;

    const { error } = await supabase.from("task_scheduler_tasks").insert({
      user_id: userId,
      title: taskData.title,
      description: taskData.description || null,
      frequency_type: taskData.frequency_type,
      frequency_value: taskData.frequency_value,
      day_of_month: taskData.day_of_month || null,
      start_date: taskData.start_date,
      next_due_date: next_due_date,
      notify_via: taskData.notify_via,
      category: taskData.category,
      reminder_lead_time_days: taskData.reminder_lead_time_days || null,
      active: true,
    });

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error: "Failed to create task" };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function completeTask(taskId: string): Promise<ActionResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createAdminClient();

    // Get the task
    const { data: task, error: fetchError } = await supabase
      .from("task_scheduler_tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !task) {
      return { success: false, error: "Task not found" };
    }

    const now = new Date().toISOString();

    // Record the completion
    const { error: completionError } = await supabase
      .from("task_scheduler_task_completions")
      .insert({
        task_id: taskId,
        user_id: userId,
        completed_at: now,
      });

    if (completionError) {
      console.error("Completion error:", completionError);
      return { success: false, error: "Failed to record completion" };
    }

    // Calculate next due date using the Postgres function
    const { data: nextDueData, error: calcError } = await supabase.rpc(
      "task_scheduler_calculate_next_due_date",
      {
        p_last_completed: now,
        p_frequency_type: task.frequency_type,
        p_frequency_value: task.frequency_value,
        p_day_of_month: task.day_of_month,
      }
    );

    if (calcError) {
      console.error("Calculation error:", calcError);
      return { success: false, error: "Failed to calculate next due date" };
    }

    // Update the task with new due date and completion time
    const { error: updateError } = await supabase
      .from("task_scheduler_tasks")
      .update({
        last_completed_at: now,
        next_due_date: nextDueData,
      })
      .eq("id", taskId);

    if (updateError) {
      console.error("Update error:", updateError);
      return { success: false, error: "Failed to update task" };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error completing task:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function snoozeTask(
  taskId: string,
  snoozedUntil: string
): Promise<ActionResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createAdminClient();

    const { error } = await supabase
      .from("task_scheduler_tasks")
      .update({ snoozed_until: snoozedUntil })
      .eq("id", taskId)
      .eq("user_id", userId);

    if (error) {
      console.error("Snooze error:", error);
      return { success: false, error: "Failed to snooze task" };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error snoozing task:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteTask(taskId: string): Promise<ActionResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createAdminClient();

    // Delete the task (completions will cascade delete)
    const { error } = await supabase
      .from("task_scheduler_tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", userId);

    if (error) {
      console.error("Delete error:", error);
      return { success: false, error: "Failed to delete task" };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateTask(
  taskId: string,
  taskData: {
    title: string;
    description?: string;
    frequency_type: string;
    frequency_value: number;
    day_of_month?: number | null;
    start_date: string;
    notify_via: string;
    category: string;
    reminder_lead_time_days?: number | null;
  }
): Promise<ActionResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createAdminClient();

    // Get the existing task to verify ownership
    const { data: existingTask, error: fetchError } = await supabase
      .from("task_scheduler_tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingTask) {
      return { success: false, error: "Task not found" };
    }

    const { error } = await supabase
      .from("task_scheduler_tasks")
      .update({
        title: taskData.title,
        description: taskData.description || null,
        frequency_type: taskData.frequency_type,
        frequency_value: taskData.frequency_value,
        day_of_month: taskData.day_of_month || null,
        start_date: taskData.start_date,
        notify_via: taskData.notify_via,
        category: taskData.category,
        reminder_lead_time_days: taskData.reminder_lead_time_days || null,
      })
      .eq("id", taskId)
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error: "Failed to update task" };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
