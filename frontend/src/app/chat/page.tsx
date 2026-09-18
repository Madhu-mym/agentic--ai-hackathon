import React from "react";
import { ChatBot } from "@/components/ChatBot";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  BookOpen,
  Info,
  CheckCircle2,
} from "lucide-react";

export default function ChatPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Onboarding AI Assistant
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ask conversational questions about policies, benefits, IT setup, and company culture.
        </p>
      </div>

      {/* Main Grid: Copilot + Context Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main Chat Interface */}
        <div className="lg:col-span-3">
          <ChatBot />
        </div>

        {/* Right Info & Knowledge Base Panel */}
        <div className="space-y-4">
          {/* Grounding & Confidence Card */}
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Grounded Knowledge Base</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Responses are synthesized directly from verified internal documents:
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>2026 Employee Handbook</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Engineering Playbook & RFCs</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>IT Security & Equipment Policy</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Benefits, 401(k) & PTO Summary</span>
              </li>
            </ul>
          </div>

          {/* Privacy & Enterprise Security */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Enterprise Privacy</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Conversations stay within our organization boundary. Prompts are never used to train public models.
            </p>
          </div>

          {/* API Preparedness Notice */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Backend Architecture</span>
            </div>
            <p className="text-[11px] text-indigo-950/80 leading-relaxed">
              Connected to typed payload schemas ready for FastAPI RAG endpoint (<code className="text-[10px] font-mono bg-white px-1 py-0.5 rounded border border-indigo-200">/api/chat</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
