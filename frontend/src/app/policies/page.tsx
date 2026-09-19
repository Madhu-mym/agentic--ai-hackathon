"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/Supabase";
import {
  Search,
  BookOpen,
  Clock,
  ArrowUpRight,
  X,
  FileText,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { CompanyPolicy } from "@/lib/mockData";

export default function PoliciesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeModalPolicy, setActiveModalPolicy] = useState<CompanyPolicy | null>(null);

  const [policies, setPolicies] = useState<CompanyPolicy[]>([]);

  const categories = ["All", "Workplace", "Engineering", "Security", "HR & Benefits", "Finance"];
  useEffect(() => {
    const loadPolicies = async () => {
      const { data, error } = await supabase
        .from("policies")
        .select("*")
        .order("created_at", { ascending: false });
  
      if (error) {
        console.error("Error loading policies:", error);
        return;
      }
  
      setPolicies(
        (data || []).map((policy) => ({
          id: policy.id,
          title: policy.title,
          summary: policy.description,
          category: policy.category,
          tags: [],
          readTimeMinutes: 3,
          lastUpdated: new Date(policy.created_at).toLocaleDateString(),
          contentPreview: policy.description,
        }))
      );
    };
  
    loadPolicies();
  }, []);

  const filteredPolicies = policies.filter((policy) => {
    const matchesCategory = selectedCategory === "All" || policy.category === selectedCategory;
    const matchesSearch =
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Knowledge</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Knowledge base
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Search verified standards for remote work, health benefits, equipment allowances, and engineering best practices.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g. stipend, 401k, remote, github, pto)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-100 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Category:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Policies Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
          <span>Showing {filteredPolicies.length} policy documents</span>
          {selectedCategory !== "All" && (
            <span>Filtered by: {selectedCategory}</span>
          )}
        </div>

        {filteredPolicies.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200/80 text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No matching policies found</p>
            <p className="text-xs text-slate-400 mt-1">Try refining your search terms or clearing the category filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPolicies.map((policy) => (
              <div
                key={policy.id}
                onClick={() => setActiveModalPolicy(policy)}
                className="bg-white rounded-xl border border-slate-200/80 p-5 hover:border-indigo-400/60 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/70">
                      {policy.category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{policy.readTimeMinutes} min read</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {policy.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                      {policy.summary}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {policy.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/50"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span className="text-[11px] text-slate-400 font-normal">
                    Updated {policy.lastUpdated}
                  </span>
                  <div className="flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Read Policy</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Policy Preview Modal */}
      {activeModalPolicy && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  {activeModalPolicy.category}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-2">
                  {activeModalPolicy.title}
                </h2>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                  <span>Last updated: {activeModalPolicy.lastUpdated}</span>
                  <span>•</span>
                  <span>{activeModalPolicy.readTimeMinutes} min read</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalPolicy(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="font-semibold text-slate-800">Executive Summary</p>
                <p className="text-slate-600 mt-1">{activeModalPolicy.summary}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2">Policy Extract & Full Guidelines</h4>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {activeModalPolicy.contentPreview}
                </p>
                <p className="text-slate-500 mt-3 text-[11px] italic">
                  Note: For legal or compliance inquiries, contact People Operations via Slack or email.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-500">Related Tags:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activeModalPolicy.tags.map((t) => (
                    <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Internal Document</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveModalPolicy(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
