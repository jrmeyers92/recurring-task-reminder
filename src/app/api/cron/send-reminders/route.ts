import { createAdminClient } from "@/lib/supabase/clients/admin";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  try {
    // Security: Verify the cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createAdminClient();
    const today = new Date().toISOString().split("T")[0];

    console.log("Running cron job for date:", today);

    // Get tasks due today that haven't been notified yet
    // In the query, update the filter:
    const { data: dueTasks, error } = await supabase
      .from("task_scheduler_tasks")
      .select(
        `
    id,
    title,
    description,
    next_due_date,
    notify_via,
    completion_token,
    user_id,
    paused,
    snoozed_until,
    task_scheduler_profiles (
      email,
      phone,
      notify_via
    )
  `
      )
      .eq("active", true)
      .eq("paused", false)
      .or(`snoozed_until.is.null,snoozed_until.lt.${today}`)
      .lte("next_due_date", today)
      .or(`last_notified_at.is.null,last_notified_at.lt.${today}T00:00:00`);

    if (error) {
      console.error("Error fetching tasks:", error);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    if (!dueTasks || dueTasks.length === 0) {
      console.log("No tasks due today");
      return NextResponse.json({
        message: "No tasks to notify",
        sent: 0,
      });
    }

    console.log(`Found ${dueTasks.length} tasks to notify`);

    // Group tasks by user email
    const tasksByUser = new Map<string, typeof dueTasks>();

    for (const task of dueTasks) {
      const profile = Array.isArray(task.task_scheduler_profiles)
        ? task.task_scheduler_profiles[0]
        : task.task_scheduler_profiles;

      if (!profile || !profile.email) {
        console.log(`No profile found for task ${task.id}`);
        continue;
      }

      const notifyMethod = task.notify_via || profile.notify_via || "email";

      // Only include tasks where email notification is enabled
      if (notifyMethod === "email" || notifyMethod === "both") {
        const userTasks = tasksByUser.get(profile.email) || [];
        userTasks.push(task);
        tasksByUser.set(profile.email, userTasks);
      }
    }

    let emailsSent = 0;
    let emailsFailed = 0;
    const now = new Date().toISOString();

    // Send one email per user with all their tasks
    for (const [email, userTasks] of tasksByUser.entries()) {
      try {
        const taskCount = userTasks.length;
        const subject =
          taskCount === 1
            ? `⏰ Reminder: ${userTasks[0].title} is due today`
            : `⏰ Reminder: ${taskCount} tasks are due today`;

        // Generate HTML for each task
        const tasksHtml = userTasks
          .map(
            (task) => `
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #333; font-size: 20px;">${
                task.title
              }</h3>
              ${
                task.description
                  ? `<p style="color: #666; margin: 10px 0;">${task.description}</p>`
                  : ""
              }
              <p style="color: #999; font-size: 14px; margin: 10px 0 0 0;">
                📅 Due: ${new Date(task.next_due_date).toLocaleDateString()}
              </p>
              <div style="margin-top: 15px;">
                <a href="${
                  process.env.NEXT_PUBLIC_APP_URL
                }/api/tasks/complete?token=${task.completion_token}" 
                   style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 14px;">
                  ✓ Mark as Complete
                </a>
              </div>
            </div>
          `
          )
          .join("");

        await resend.emails.send({
          from: "Task Reminders <onboarding@resend.dev>",
          to: email,
          subject,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">📋 Task Reminder</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <h2 style="color: #667eea; margin-top: 0;">
                    ${
                      taskCount === 1
                        ? "Task Due Today"
                        : `${taskCount} Tasks Due Today`
                    }
                  </h2>
                  
                  ${tasksHtml}
                  
                  <p style="color: #999; font-size: 13px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    You can also manage your tasks from your <a href="${
                      process.env.NEXT_PUBLIC_APP_URL
                    }/dashboard" style="color: #667eea;">dashboard</a>.
                  </p>
                </div>
              </body>
            </html>
          `,
        });

        console.log(`✅ Email sent to ${email} with ${taskCount} task(s)`);
        emailsSent++;

        // Update last_notified_at for all tasks for this user
        for (const task of userTasks) {
          await supabase
            .from("task_scheduler_tasks")
            .update({ last_notified_at: now })
            .eq("id", task.id);
        }
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${email}:`, emailError);
        emailsFailed++;
      }
    }

    const summary = {
      message: "Cron job completed",
      tasksProcessed: dueTasks.length,
      emailsSent,
      emailsFailed,
      uniqueUsers: tasksByUser.size,
      timestamp: now,
    };

    console.log("Cron job summary:", summary);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
