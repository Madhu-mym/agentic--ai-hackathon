"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, UserCheck, CheckCircle2 } from "lucide-react";
import { CURRENT_USER } from "@/lib/mockData";
import { NAV_ITEMS } from "@/lib/nav";
import { useTasks } from "@/lib/taskContext";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { completedCount, totalCount, progressPercent } = useTasks();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200/80 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden lg:flex">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-slate-900 text-white shadow-xs font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        active ? "text-indigo-400" : "text-slate-400"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        active
                          ? "bg-indigo-500/30 text-indigo-200"
                          : "bg-indigo-50 text-indigo-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Onboarding Progress</span>
            </span>
            <span className="text-xs font-bold text-indigo-600">{progressPercent}%</span>
          </div>

          <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-tight">
            {completedCount} of {totalCount} onboarding tasks completed.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/70 bg-white shadow-2xs space-y-2">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Assigned Buddy</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">{CURRENT_USER.buddy.name}</p>
            <p className="text-[11px] text-slate-500">{CURRENT_USER.buddy.role}</p>
          </div>
          <Link
            href="/contacts"
            className="inline-block text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Open directory &rarr;
          </Link>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center space-x-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Need help?</span>
        </span>
        <Link href="/chat" className="text-slate-600 hover:text-indigo-600 font-medium">
          Ask AI
        </Link>
      </div>
    </aside>
  );
};
