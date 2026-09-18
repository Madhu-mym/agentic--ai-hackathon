"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { INITIAL_TASKS, TaskItem } from "@/lib/mockData";

interface TaskContextValue {
  tasks: TaskItem[];
  toggleTask: (id: string) => void;
  completedCount: number;
  remainingCount: number;
  totalCount: number;
  progressPercent: number;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const value = useMemo(() => {
    const completedCount = tasks.filter((t) => t.isCompleted).length;
    const totalCount = tasks.length;
    return {
      tasks,
      toggleTask,
      completedCount,
      remainingCount: totalCount - completedCount,
      totalCount,
      progressPercent: totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
    };
  }, [tasks]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
