import { CreateTaskButton } from "@/components/dashboard/CreateTaskButton";
import { TaskList } from "@/components/dashboard/TaskList";
import { TaskStats } from "@/components/dashboard/TaskStats";
import { createAdminClient } from "@/lib/supabase/clients/admin";
import { Task } from "@/types/database.types";
import { auth } from "@clerk/nextjs/server";
import { AlertCircle, Calendar, CheckCircle2 } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createAdminClient();

  // Fetch all active tasks for the user
  const { data: tasks, error } = await supabase
    .from("task_scheduler_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .order("next_due_date", { ascending: true });

  if (error) {
    console.error("Error fetching tasks:", error);
  }

  const allTasks = (tasks || []) as Task[];

  // Calculate task statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = allTasks.filter((task) => {
    const dueDate = new Date(task.next_due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  const dueTodayTasks = allTasks.filter((task) => {
    const dueDate = new Date(task.next_due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  const upcomingTasks = allTasks.filter((task) => {
    const dueDate = new Date(task.next_due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate > today;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your recurring tasks and stay on track
            </p>
          </div>
          <CreateTaskButton />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <TaskStats
            title="Overdue"
            count={overdueTasks.length}
            icon={<AlertCircle className="text-destructive" />}
            variant="destructive"
          />
          <TaskStats
            title="Due Today"
            count={dueTodayTasks.length}
            icon={<Calendar className="text-primary" />}
            variant="primary"
          />
          <TaskStats
            title="Upcoming"
            count={upcomingTasks.length}
            icon={<CheckCircle2 className="text-green-600" />}
            variant="success"
          />
        </div>

        {/* Task Lists */}
        <div className="space-y-8">
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="text-destructive" size={24} />
                Overdue Tasks
              </h2>
              <TaskList tasks={overdueTasks} variant="overdue" />
            </div>
          )}

          {/* Due Today */}
          {dueTodayTasks.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="text-primary" size={24} />
                Due Today
              </h2>
              <TaskList tasks={dueTodayTasks} variant="today" />
            </div>
          )}

          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-green-600" size={24} />
                Upcoming Tasks
              </h2>
              <TaskList tasks={upcomingTasks} variant="upcoming" />
            </div>
          )}

          {/* Empty State */}
          {allTasks.length === 0 && (
            <div className="text-center py-12 bg-muted/50 rounded-lg border-2 border-dashed">
              <Calendar
                className="mx-auto text-muted-foreground mb-4"
                size={48}
              />
              <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first recurring task to get started
              </p>
              <CreateTaskButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
