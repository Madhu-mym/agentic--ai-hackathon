"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, UserCheck, Search, Globe2 } from "lucide-react";
import { TEAM_MEMBERS, TeamMember } from "@/lib/mockData";

export const ContactDirectory: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const departments = ["All", "Core Infrastructure", "Engineering Leadership", "Information Technology", "People Operations"];

  const filteredMembers = TEAM_MEMBERS.filter((member) => {
    const matchesDept = selectedDept === "All" || member.department === selectedDept;
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Team & Mentor Directory
          </h2>
          <p className="text-xs text-slate-500">
            Connect with your assigned buddy and departmental peers
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or role..."
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

      {/* Contact Cards Grid */}
      <div className="space-y-2.5">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
              member.isMentor
                ? "bg-amber-50/40 border-amber-200/80 hover:bg-amber-50/70 shadow-2xs"
                : "bg-white border-slate-200/70 hover:bg-slate-50/70"
            }`}
          >
            {/* Member Info */}
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
                <div className="flex items-center space-x-2">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {member.name}
                  </p>
                  {member.isMentor && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      <UserCheck className="w-2.5 h-2.5" />
                      <span>Onboarding Buddy</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{member.role}</p>
                <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-0.5">
                  <span>{member.department}</span>
                  <span className="flex items-center space-x-0.5">
                    <Globe2 className="w-2.5 h-2.5" />
                    <span>{member.timezone}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Contact Actions */}
            <div className="flex items-center space-x-1 shrink-0">
              <a
                href={`mailto:${member.email}`}
                title={`Send email to ${member.name}`}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
              <span
                title={`Slack: ${member.slackHandle}`}
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
