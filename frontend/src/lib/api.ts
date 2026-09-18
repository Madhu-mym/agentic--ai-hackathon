/**
 * REST API Client for communicating with the FastAPI backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface HealthCheckResponse {
  status: string;
  app: string;
  timestamp: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  is_completed: boolean;
  due_date?: string;
}

export interface UserContact {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar_url?: string;
  is_mentor: boolean;
}

export interface RequestItem {
  id: string;
  request_type: string;
  title: string;
  details?: string;
  priority: string;
  status: string;
}

export const apiClient = {
  /**
   * Check backend health status
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) {
      throw new Error(`Health check failed: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Fetch onboarding checklist tasks
   */
  async getTasks(): Promise<TaskItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/tasks`);
    if (!res.ok) {
      throw new Error(`Failed to fetch tasks: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Fetch team and mentor directory
   */
  async getTeamDirectory(): Promise<UserContact[]> {
    const res = await fetch(`${API_BASE_URL}/api/users`);
    if (!res.ok) {
      throw new Error(`Failed to fetch directory: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Send chat prompt to assistant
   */
  async sendChatMessage(message: string, sessionId?: string): Promise<{ response: string; sources: string[] }> {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id: sessionId }),
    });
    if (!res.ok) {
      throw new Error(`Failed to send message: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Fetch all submitted requests
   */
  async getRequests(): Promise<RequestItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/requests`);
    if (!res.ok) {
      throw new Error(`Failed to fetch requests: ${res.statusText}`);
    }
    return res.json();
  },
};
