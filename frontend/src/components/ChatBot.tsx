"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  FileText,
  RotateCcw,
} from "lucide-react";
import {
  ChatMessage,
  SUGGESTED_CHAT_PROMPTS,
} from "@/lib/mockData";

import { apiClient } from "@/lib/api";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-welcome",
    role: "assistant",
    content:
      "Welcome to your onboarding assistant.\n\nI can help with company policies, workstation setup, equipment expenses, and first-week access. Ask a question below or use a suggested prompt.",
    timestamp: "9:12 AM",
    sources: ["onboarding_welcome_guide.md §1.0"],
  },
  {
    id: "msg-user-sample",
    role: "user",
    content: "How do I request GitHub write access so I can clone the core repositories?",
    timestamp: "9:13 AM",
  },
  {
    id: "msg-assistant-sample",
    role: "assistant",
    content:
      "Submit an Access Request for GitHub Enterprise Write Access. Your manager and IT typically approve it within one business day, then you are added to the Core Infrastructure GitHub team.\n\nUntil that lands, you can still follow the Engineering Setup playbook and complete local toolchain setup.",
    timestamp: "9:13 AM",
    sources: ["onboarding_welcome_guide.md §3.2", "github_workflow_standards.md", "it_access_catalog.md"],
  },
];

interface ChatBotProps {
  initialPrompt?: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ initialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState(initialPrompt || "");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  /**
   * Helper that simulates retrieval & response generation using mock data.
   * Architecture note: In Phase 2/3, this method connects directly to `apiClient.sendChatMessage(prompt)`.
   */
  const handleSendMessage = async (promptToSend?: string) => {
    const text = (promptToSend || inputPrompt).trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    setIsTyping(true);

    // Determine matching mock response based on keywords
    try {
      const result = await apiClient.sendChatMessage(text, "demo");
    
      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: "assistant",
        content: result.response,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sources: result.sources,
      };
    
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: "assistant",
        content:
          "Sorry, I couldn't connect to the onboarding assistant. Please make sure the backend is running.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
    };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
};

 

  const resetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-[680px] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200/80 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-slate-900">
                Onboarding AI Copilot
              </h3>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Grounded Knowledge Base</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Retrieves answers directly from verified enterprise policies & wikis
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetChat}
          title="Reset conversation"
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                msg.role === "user"
                  ? "bg-slate-900 text-white"
                  : "bg-indigo-600 text-white shadow-2xs"
              }`}
            >
              {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-xl p-4 text-xs leading-relaxed space-y-2.5 ${
                msg.role === "user"
                  ? "bg-slate-900 text-white rounded-tr-none shadow-xs"
                  : "bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-2xs"
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">
                {msg.content}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                    <BookOpen className="w-3 h-3 text-indigo-500" />
                    <span>Sources</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono border border-slate-200/60"
                      >
                        <FileText className="w-2.5 h-2.5 text-slate-400" />
                        <span>{src}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`text-[9px] ${
                  msg.role === "user" ? "text-slate-400 text-right" : "text-slate-400"
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl rounded-tl-none px-4 py-3 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                />
                <span className="text-[11px] text-slate-500 font-medium pl-1.5">
                  Searching verified policies...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center space-x-2 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Ask:</span>
        </span>
        {SUGGESTED_CHAT_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] text-slate-600 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 rounded-full px-3 py-1 whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200/80">
        <div className="flex items-end space-x-2 bg-slate-50 rounded-xl p-2 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <textarea
            rows={1}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about employee guidelines, tools, or benefits (Press Enter to send)..."
            className="flex-1 bg-transparent border-0 resize-none text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none p-1.5 max-h-24"
          />

          <button
            type="button"
            disabled={!inputPrompt.trim() || isTyping}
            onClick={() => handleSendMessage()}
            className="p-2 bg-slate-900 hover:bg-indigo-600 disabled:opacity-30 text-white rounded-lg transition-colors shrink-0 shadow-xs flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1.5">
          <span>AI answers are grounded in internal employee handbooks.</span>
          <span className="hidden sm:inline">Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
};
