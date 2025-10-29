"use client";

import { Task } from "@/types/database.types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  variant: "overdue" | "today" | "upcoming";
}

export function TaskList({ tasks, variant }: TaskListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} variant={variant} />
      ))}
    </div>
  );
}
