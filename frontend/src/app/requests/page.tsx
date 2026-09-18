"use client";

import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  Clock,
  KeyRound,
  Monitor,
  Laptop,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  ShieldAlert,
} from "lucide-react";
import {
  INITIAL_REQUESTS,
  REQUEST_CATALOG,
  AccessRequestItem,
} from "@/lib/mockData";

export default function RequestsPage() {
  const [requests, setRequests] = useState<AccessRequestItem[]>(INITIAL_REQUESTS);
  const [requestType, setRequestType] = useState<AccessRequestItem["type"]>("Software");
  const [selectedTool, setSelectedTool] = useState("");
  const [customToolName, setCustomToolName] = useState("");
  const [justification, setJustification] = useState("");
  const [priority, setPriority] = useState<AccessRequestItem["priority"]>("Medium");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Approved">("All");
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  // Available catalog tools based on chosen category
  const availableTools = REQUEST_CATALOG[requestType] || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalToolName = selectedTool === "Other" || !selectedTool ? customToolName.trim() : selectedTool;
    if (!finalToolName || !justification.trim()) return;

    const newRequest: AccessRequestItem = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      type: requestType,
      toolName: finalToolName,
      justification: justification.trim(),
      priority,
      status: "Pending",
      submittedAt: "Just now",
      approver: "IT Operations & Manager Review",
    };

    setRequests([newRequest, ...requests]);
    setSelectedTool("");
    setCustomToolName("");
    setJustification("");
    setPriority("Medium");
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 4500);
  };

  const filteredRequests = requests.filter((req) => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Pending") return req.status === "Pending" || req.status === "In Review";
    if (statusFilter === "Approved") return req.status === "Approved";
    return true;
  });

  const getPriorityBadge = (p: AccessRequestItem["priority"]) => {
    switch (p) {
      case "Urgent":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "High":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Medium":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Low":
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Tools, Hardware & Access Requests
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Submit standardized requests for software licenses, developer permissions, or hardware peripherals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: New Request Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Submit a New Access Request
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Requests are routed to your team lead and IT operations for automated provisioning.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              SLA: 24–48h
            </span>
          </div>

          {/* Success Notification Alert */}
          {isSuccessToast && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-emerald-900 text-xs animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Request Submitted Successfully!</p>
                <p className="text-emerald-700 mt-0.5">
                  Your ticket was assigned an ID and queued for manager and IT approval. You can track progress in the Request History section.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Request Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "Software", label: "Software", icon: KeyRound },
                  { id: "Hardware", label: "Hardware", icon: Monitor },
                  { id: "Cloud & Infrastructure", label: "Cloud & Infra", icon: Laptop },
                  { id: "General", label: "General", icon: HelpCircle },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = requestType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setRequestType(item.id as any);
                        setSelectedTool("");
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? "text-indigo-300" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tool / Software Selection Catalog */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Tool or Hardware Item
              </label>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="">Select an item from the enterprise catalog...</option>
                {availableTools.map((tool) => (
                  <option key={tool} value={tool}>
                    {tool}
                  </option>
                ))}
                <option value="Other">Other (Specify below)...</option>
              </select>

              {(selectedTool === "Other" || availableTools.length === 0) && (
                <input
                  type="text"
                  required
                  value={customToolName}
                  onChange={(e) => setCustomToolName(e.target.value)}
                  placeholder="Specify tool or equipment name (e.g. Docker Desktop Pro, YubiKey 5C)..."
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 mt-2"
                />
              )}
            </div>

            {/* Business Justification */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Business Justification
              </label>
              <textarea
                rows={3}
                required
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explain the project or workflow requiring this access/tool..."
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Priority Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                4. Priority Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["Low", "Medium", "High", "Urgent"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      priority === p
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Request</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Request Status Tracker */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Request History & Status
              </h3>
              <p className="text-[11px] text-slate-400">
                Live status of submitted tickets
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700">
              {requests.length} Total
            </span>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200/60">
            {(["All", "Pending", "Approved"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  statusFilter === tab
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Request Tickets List */}
          <div className="space-y-3">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-lg border border-slate-200/70 bg-slate-50/50 space-y-2 hover:bg-white hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {req.id}
                  </span>

                  {req.status === "Approved" ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Approved</span>
                    </span>
                  ) : req.status === "In Review" ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>In Review</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Pending Approval</span>
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {req.toolName}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {req.justification}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px]">
                  <span
                    className={`px-1.5 py-0.5 rounded border font-semibold ${getPriorityBadge(
                      req.priority
                    )}`}
                  >
                    {req.priority}
                  </span>
                  <span className="text-slate-400">{req.submittedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
