"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/Supabase";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: string;
  isCompleted: boolean;
}

interface TaskContextValue {
  tasks: TaskItem[];
  toggleTask: (id: string) => void;
  completedCount: number;
  remainingCount: number;
  totalCount: number;
  progressPercent: number;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      const { data, error } = await supabase
        .from("onboarding_tasks")
        .select("*")
        .order("order_number", { ascending: true });
    
      if (error) {
        console.error("Error loading tasks:", error);
        setLoading(false);
        return;
      }
    
      const { data: progressData, error: progressError } = await supabase
        .from("task_progress")
        .select("task_id, status")
        .eq("user_id", "11111111-1111-1111-1111-111111111111");
    
      if (progressError) {
        console.error("Error loading task progress:", progressError);
      }
    
      const progressMap = new Map(
        (progressData || []).map((progress) => [
          progress.task_id,
          progress.status,
        ])
      );
    
      setTasks(
        (data || []).map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          category: task.category,
          isCompleted: progressMap.get(task.id) === "completed",
        }))
      );
    
      setLoading(false);
    };

    loadTasks();
  }, []);

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
  
    if (!task) return;
  
    const newCompletedState = !task.isCompleted;
  
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, isCompleted: newCompletedState }
          : t
      )
    );
  
    const { error } = await supabase
      .from("task_progress")
      .upsert(
        {
          user_id: "11111111-1111-1111-1111-111111111111",
          task_id: id,
          status: newCompletedState ? "completed" : "not_started",
          completed_at: newCompletedState ? new Date().toISOString() : null,
        },
        {
          onConflict: "user_id,task_id",
        }
      );
  
    if (error) {
      console.error("Error saving task progress:", error);
    }
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
      progressPercent:
        totalCount === 0
          ? 0
          : Math.round((completedCount / totalCount) * 100),
    };
  }, [tasks]);

  if (loading) {
    return <div>Loading onboarding tasks...</div>;
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }

  return context;
};