import { createAdminClient } from "@/lib/supabase/clients/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/dashboard?error=missing_token", request.url)
    );
  }

  try {
    const supabase = await createAdminClient();

    // Find the task by completion token
    const { data: task, error: fetchError } = await supabase
      .from("task_scheduler_tasks")
      .select("*")
      .eq("completion_token", token)
      .eq("active", true)
      .single();

    if (fetchError || !task) {
      return NextResponse.redirect(
        new URL("/dashboard?error=task_not_found", request.url)
      );
    }

    const now = new Date().toISOString();

    // Record the completion
    const { error: completionError } = await supabase
      .from("task_scheduler_task_completions")
      .insert({
        task_id: task.id,
        user_id: task.user_id,
        completed_at: now,
      });

    if (completionError) {
      console.error("Completion error:", completionError);
      return NextResponse.redirect(
        new URL("/dashboard?error=completion_failed", request.url)
      );
    }

    // Calculate next due date
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
      return NextResponse.redirect(
        new URL("/dashboard?error=calculation_failed", request.url)
      );
    }

    // Update the task
    const { error: updateError } = await supabase
      .from("task_scheduler_tasks")
      .update({
        last_completed_at: now,
        next_due_date: nextDueData,
      })
      .eq("id", task.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.redirect(
        new URL("/dashboard?error=update_failed", request.url)
      );
    }

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      new URL(
        `/dashboard?completed=true&task=${encodeURIComponent(task.title)}`,
        request.url
      )
    );
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=server_error", request.url)
    );
  }
}
