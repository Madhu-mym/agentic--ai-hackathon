"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Bell, Menu, X, Search } from "lucide-react";
import { CURRENT_USER } from "@/lib/mockData";
import { NAV_ITEMS } from "@/lib/nav";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:bg-indigo-600 transition-colors">
            <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight leading-none">
                Future-Ready
              </span>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-center leading-none">
                Onboarding
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal leading-none mt-0.5 hidden sm:block">
              Enterprise Employee Portal
            </p>
          </div>
        </Link>

        <nav className="hidden xl:flex items-center space-x-1 pl-4 border-l border-slate-200/80 text-xs font-medium">
          {NAV_ITEMS.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  active
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center space-x-3">
        <Link
          href="/knowledge"
          className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/70 text-slate-400 hover:text-slate-600 hover:border-slate-300 text-xs transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search handbook...</span>
        </Link>

        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
        </button>

        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-100 shadow-xs">
            {CURRENT_USER.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-semibold text-slate-900 leading-tight">
              {CURRENT_USER.name}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">
              {CURRENT_USER.role}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors ml-1"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="xl:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 space-y-2 z-50">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
            Navigation
          </p>
          {NAV_ITEMS.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
