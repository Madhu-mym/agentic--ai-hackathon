"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  BookOpen,
  KeyRound,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ListChecks,
} from "lucide-react";
import { CURRENT_USER } from "@/lib/mockData";
import { useTasks } from "@/lib/taskContext";

export default function DashboardPage() {
  const { tasks, completedCount, remainingCount, totalCount, progressPercent } = useTasks();
  const remainingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{CURRENT_USER.startDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome to the team, {CURRENT_USER.name}!
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              You are signed in as a <span className="font-semibold text-slate-700">{CURRENT_USER.role}</span> on the{" "}
              <span className="font-semibold text-slate-700">{CURRENT_USER.department}</span> team. Your onboarding buddy is{" "}
              <span className="font-semibold text-indigo-600">{CURRENT_USER.buddy.name}</span>.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 shrink-0 min-w-[220px]">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Onboarding progress
            </p>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-3xl font-bold text-slate-900">{progressPercent}%</span>
              <span className="text-xs text-slate-500">complete</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-3">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {completedCount} completed · {remainingCount} remaining
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/tasks"
            className="group p-5 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-500/50 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <ListChecks className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Continue tasks</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {remainingCount} of {totalCount} onboarding items still open.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100">
              <span>Open checklist</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/chat"
            className="group p-5 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-500/50 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Ask AI Assistant
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ask about GitHub access, benefits, or first-week setup.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-indigo-600 pt-2 border-t border-slate-100">
              <span>Open chat</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/knowledge"
            className="group p-5 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-500/50 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Browse knowledge
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Company policies for remote work, security, and engineering.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-blue-600 pt-2 border-t border-slate-100">
              <span>View documents</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/requests"
            className="group p-5 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-500/50 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Request GitHub access
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Submit a mock access request for tools, cloud, or hardware.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-emerald-600 pt-2 border-t border-slate-100">
              <span>Open form</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Remaining tasks</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
              {remainingCount} open
            </span>
          </div>
          <div className="space-y-2.5">
            {remainingTasks.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="p-2.5 rounded-lg border border-slate-200 text-xs flex items-start space-x-2.5 bg-white"
              >
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">{t.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t.category} · {t.timeframe} · ~{t.estimatedMinutes}m
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/tasks" className="inline-flex items-center text-xs font-semibold text-indigo-600">
            Manage all tasks
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Completed tasks</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              {completedCount} done
            </span>
          </div>
          <div className="space-y-2.5">
            {completedTasks.map((t) => (
              <div
                key={t.id}
                className="p-2.5 rounded-lg border border-slate-200/50 text-xs flex items-start space-x-2.5 bg-slate-50/70 text-slate-400"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold line-through">{t.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t.category} · {t.timeframe}</p>
                </div>
              </div>
            ))}
            {completedTasks.length === 0 && (
              <p className="text-xs text-slate-400">No tasks completed yet.</p>
            )}
          </div>
          <Link href="/contacts" className="inline-flex items-center text-xs font-semibold text-indigo-600">
            <Users className="w-3.5 h-3.5 mr-1" />
            Find HR, IT, or your manager
          </Link>
        </div>
      </div>
    </div>
  );
}
