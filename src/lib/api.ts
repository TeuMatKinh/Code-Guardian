const API_BASE = "/api";

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Request failed");
    }
    return response.json();
  },

  login: (credentials: any) => api.request("/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (data: any) => api.request("/register", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => api.request("/me"),
  getCourses: () => api.request("/courses"),
  completeDay: (data: { courseId: string; dayNumber: number }) => api.request("/complete-day", { method: "POST", body: JSON.stringify(data) }),
  updateSettings: (settings: { language: string; theme: string }) => api.request("/settings", { method: "POST", body: JSON.stringify(settings) }),
};
