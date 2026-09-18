"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  BookOpen,
  Send,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { CURRENT_USER, INITIAL_TASKS } from "@/lib/mockData";
import { TaskChecklist } from "@/components/TaskChecklist";
import { ContactDirectory } from "@/components/ContactDirectory";

export default function DashboardPage() {
  const [tasks] = useState(INITIAL_TASKS);

  const completedTasks = tasks.filter((t) => t.isCompleted);
  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const overallPercent = Math.round((completedTasks.length / tasks.length) * 100);

  const day1Tasks = tasks.filter((t) => t.timeframe === "Day 1");
  const day1Completed = day1Tasks.filter((t) => t.isCompleted);
  const day1Percent = Math.round((day1Completed.length / day1Tasks.length) * 100);

  const week1Tasks = tasks.filter((t) => t.timeframe === "Week 1");
  const week1Completed = week1Tasks.filter((t) => t.isCompleted);
  const week1Percent = Math.round((week1Completed.length / week1Tasks.length) * 100);

  const scrollToDirectory = () => {
    const el = document.getElementById("team-directory-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Hero Section */}
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

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 sm:gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200/70 shrink-0">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Overall Status
              </p>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-2xl font-bold text-slate-900">{overallPercent}%</span>
                <span className="text-xs text-slate-500">completed</span>
              </div>
            </div>
            <div className="h-9 w-px bg-slate-200" />
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Day 1 Milestone
              </p>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-2xl font-bold text-indigo-600">{day1Percent}%</span>
                <span className="text-xs text-slate-500">cleared</span>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Linear Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Day 1 Essential Progress</span>
              <span className="text-indigo-600 font-bold">{day1Completed.length} of {day1Tasks.length} Done</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${day1Percent}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">First Week Integration</span>
              <span className="text-slate-600 font-bold">{week1Completed.length} of {week1Tasks.length} Done</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-slate-700 h-full rounded-full transition-all duration-300"
                style={{ width: `${week1Percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick-Access Cards Grid (4 Enterprise Portals) */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Quick Access Portals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Ask AI */}
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
                Instant conversational answers grounded in verified employee handbooks.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-indigo-600 pt-2 border-t border-slate-100">
              <span>Open Chat</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Company Policies */}
          <Link
            href="/policies"
            className="group p-5 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-500/50 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Company Policies
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Explore guidelines on remote work, healthcare benefits, and engineering RFCs.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-blue-600 pt-2 border-t border-slate-100">
              <span>Browse Docs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Request Access */}
          <Link
            href="/requests"
            className="group p-5 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-500/50 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Request Access
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Order hardware peripherals or request software permissions and cloud seats.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-emerald-600 pt-2 border-t border-slate-100">
              <span>Create Request</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Find a Person */}
          <div
            onClick={scrollToDirectory}
            className="group p-5 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-500/50 hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                Find a Person
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Reach out to your assigned buddy, mentor, or teammates across departments.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-purple-600 pt-2 border-t border-slate-100">
              <span>View Directory</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Checklist + Priority Today's Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Interactive Task Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <TaskChecklist />
        </div>

        {/* Right Column: "Today's Tasks" Priority Card & Security Notice */}
        <div className="space-y-6">
          {/* Today's Tasks Snapshot */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Today&apos;s Essential Tasks</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                Day 1
              </span>
            </div>

            <div className="space-y-2.5">
              {day1Tasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-start space-x-2.5 ${
                    t.isCompleted
                      ? "bg-slate-50/70 border-slate-200/50 text-slate-400"
                      : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  {t.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold ${t.isCompleted ? "line-through" : ""}`}>
                      {t.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.category} • ~{t.estimatedMinutes}m</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IT Security Verification Card */}
          <div className="p-4 rounded-xl bg-slate-900 text-white shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Enterprise IT Security</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your device must pass Okta Verify and Jamf posture compliance within 48 hours of starting.
            </p>
            <Link
              href="/policies"
              className="inline-block text-[11px] font-bold text-indigo-300 hover:text-white pt-1"
            >
              Read Security Policy &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Directory Section (Anchor for "Find a Person") */}
      <div id="team-directory-section" className="pt-4">
        <ContactDirectory />
      </div>
    </div>
  );
}
