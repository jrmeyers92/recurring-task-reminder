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
        task_scheduler_profiles (
          email,
          phone,
          notify_via
        )
      `
      )
      .eq("active", true)
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

    let emailsSent = 0;
    let emailsFailed = 0;
    const now = new Date().toISOString();

    // Send notifications for each task
    for (const task of dueTasks) {
      const profile = Array.isArray(task.task_scheduler_profiles)
        ? task.task_scheduler_profiles[0]
        : task.task_scheduler_profiles;

      if (!profile || !profile.email) {
        console.log(`No profile found for task ${task.id}`);
        continue;
      }

      const notifyMethod = task.notify_via || profile.notify_via || "email";

      // Only send email if notify method is email or both
      if (notifyMethod === "email" || notifyMethod === "both") {
        const completeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/tasks/complete?token=${task.completion_token}`;

        try {
          await resend.emails.send({
            from: "Task Reminders <onboarding@resend.dev>", // Use this for testing
            to: profile.email,
            subject: `⏰ Reminder: ${task.title} is due today`,
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
                    <h2 style="color: #667eea; margin-top: 0;">Task Due Today</h2>
                    
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
                        📅 Due: ${new Date(
                          task.next_due_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${completeUrl}" 
                         style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
                        ✓ Mark as Complete
                      </a>
                    </div>
                    
                    <p style="color: #999; font-size: 13px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                      You can also mark this task complete from your <a href="${
                        process.env.NEXT_PUBLIC_APP_URL
                      }/dashboard" style="color: #667eea;">dashboard</a>.
                    </p>
                  </div>
                </body>
              </html>
            `,
          });

          console.log(`✅ Email sent for task: ${task.title}`);
          emailsSent++;
        } catch (emailError) {
          console.error(
            `❌ Failed to send email for task ${task.id}:`,
            emailError
          );
          emailsFailed++;
        }
      }

      // Update last_notified_at timestamp
      await supabase
        .from("task_scheduler_tasks")
        .update({ last_notified_at: now })
        .eq("id", task.id);
    }

    const summary = {
      message: "Cron job completed",
      tasksProcessed: dueTasks.length,
      emailsSent,
      emailsFailed,
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
