"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock,
  Tag,
  ArrowUpRight,
  Filter,
  CheckCheck,
} from "lucide-react";
import { INITIAL_TASKS, TaskItem } from "@/lib/mockData";

export const TaskChecklist: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState<"all" | "day1" | "week1" | "pending" | "completed">("all");

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Filter tasks according to active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "day1") return task.timeframe === "Day 1";
    if (activeTab === "week1") return task.timeframe === "Week 1";
    if (activeTab === "pending") return !task.isCompleted;
    if (activeTab === "completed") return task.isCompleted;
    return true;
  });

  const getCategoryColor = (cat: TaskItem["category"]) => {
    switch (cat) {
      case "IT Setup":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "HR & Compliance":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "Team & Culture":
        return "bg-purple-50 text-purple-700 border-purple-200/60";
      case "Engineering":
        return "bg-amber-50 text-amber-800 border-amber-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header & Progress Summary */}
      <div className="p-5 border-b border-slate-200/70 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">
                Onboarding Task Checklist
              </h2>
              <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {completedCount} / {totalCount} Completed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any task to toggle its completion state.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-800">{progressPercent}%</span>
              <span className="text-[10px] text-slate-400 ml-1">overall</span>
            </div>
            <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden ring-1 ring-slate-200/60">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 mt-4 pt-3 border-t border-slate-100 overflow-x-auto">
          {[
            { id: "all", label: "All Tasks" },
            { id: "day1", label: "Day 1 (Essential)" },
            { id: "week1", label: "First Week" },
            { id: "pending", label: "Pending" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors shrink-0 ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Items */}
      <div className="divide-y divide-slate-100">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <CheckCheck className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            <p>No tasks matching this filter.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 transition-colors flex items-start justify-between gap-3 group ${
                task.isCompleted ? "bg-slate-50/50 hover:bg-slate-50" : "hover:bg-slate-50/70"
              }`}
            >
              {/* Checkbox & Task info */}
              <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 text-slate-300 hover:text-indigo-600 focus:outline-none transition-colors shrink-0"
                  aria-label={`Mark "${task.title}" as ${task.isCompleted ? "incomplete" : "complete"}`}
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-600 hover:fill-indigo-50" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      onClick={() => toggleTask(task.id)}
                      className={`text-xs font-semibold cursor-pointer select-none ${
                        task.isCompleted
                          ? "line-through text-slate-400"
                          : "text-slate-800 hover:text-indigo-600"
                      }`}
                    >
                      {task.title}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded border ${getCategoryColor(
                        task.category
                      )}`}
                    >
                      {task.category}
                    </span>
                  </div>

                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      task.isCompleted ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {task.description}
                  </p>

                  <div className="flex items-center space-x-4 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{task.timeframe}</span>
                    </span>
                    <span>~{task.estimatedMinutes} mins</span>
                  </div>
                </div>
              </div>

              {/* Action Link if provided */}
              {task.actionUrl && !task.isCompleted && (
                <Link
                  href={task.actionUrl}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1 shrink-0 self-center sm:self-start"
                >
                  <span>{task.actionLabel || "Open"}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        Tip: Tasks marked &quot;Day 1&quot; must be cleared before the end of your orientation day.
      </div>
    </div>
  );
};
