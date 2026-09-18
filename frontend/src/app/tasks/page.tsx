import React from "react";
import { TaskChecklist } from "@/components/TaskChecklist";

export default function TasksPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Onboarding tasks
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Mark Day 1 and Week 1 items complete as you finish them. Progress is reflected on the dashboard.
        </p>
      </div>
      <TaskChecklist />
    </div>
  );
}
