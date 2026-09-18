"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, UserCheck, Search, Globe2, Phone } from "lucide-react";
import { TEAM_MEMBERS } from "@/lib/mockData";

export const ContactDirectory: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const departments = [
    "All",
    "Core Infrastructure",
    "Engineering Leadership",
    "Information Technology",
    "People Operations",
    "Design Systems",
  ];

  const filteredMembers = TEAM_MEMBERS.filter((member) => {
    const matchesDept = selectedDept === "All" || member.department === selectedDept;
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.directoryLabel || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">Team directory</h2>
        <p className="text-xs text-slate-500">
          Example contacts include HR, IT Support, your manager, and your assigned buddy.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, role, or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {departments.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All Departments" : d}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2.5">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className={`p-3 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              member.isMentor
                ? "bg-amber-50/40 border-amber-200/80"
                : "bg-white border-slate-200/70"
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  member.isMentor
                    ? "bg-amber-500 text-white ring-2 ring-amber-100"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {member.avatarInitials}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {member.name}
                  </p>
                  {member.directoryLabel && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-100">
                      {member.isMentor && <UserCheck className="w-2.5 h-2.5" />}
                      <span>{member.directoryLabel}</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{member.role}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 mt-1">
                  <span>{member.department}</span>
                  <span className="flex items-center space-x-0.5">
                    <Globe2 className="w-2.5 h-2.5" />
                    <span>{member.timezone}</span>
                  </span>
                  <a href={`mailto:${member.email}`} className="flex items-center space-x-0.5 hover:text-indigo-600">
                    <Mail className="w-2.5 h-2.5" />
                    <span>{member.email}</span>
                  </a>
                  <span className="flex items-center space-x-0.5">
                    <Phone className="w-2.5 h-2.5" />
                    <span>{member.phone}</span>
                  </span>
                  <span className="flex items-center space-x-0.5">
                    <MessageSquare className="w-2.5 h-2.5" />
                    <span>{member.slackHandle}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
