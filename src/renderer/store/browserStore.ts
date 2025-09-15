import { create } from 'zustand';

interface BrowserState {
  currentUrl: string;
  isLoading: boolean;
  aiChatOpen: boolean;
  theme: 'light' | 'dark';
  pageAnalysis: any | null;
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
}

interface BrowserActions {
  setCurrentUrl: (url: string) => void;
  setLoading: (loading: boolean) => void;
  navigateTo: (url: string) => void;
  toggleAIChat: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setPageAnalysis: (analysis: any) => void;
  addChatMessage: (role: 'user' | 'assistant', content: string) => void;
  clearChatHistory: () => void;
}

export const useStore = create<BrowserState & BrowserActions>((set) => ({
  // State
  currentUrl: 'https://www.google.com',
  isLoading: false,
  aiChatOpen: false,
  theme: 'light',
  pageAnalysis: null,
  chatHistory: [],

  // Actions
  setCurrentUrl: (url) => set({ currentUrl: url }),
  setLoading: (loading) => set({ isLoading: loading }),
  navigateTo: (url) => set({ currentUrl: url, isLoading: true }),
  toggleAIChat: () => set((state) => ({ aiChatOpen: !state.aiChatOpen })),
  setTheme: (theme) => set({ theme }),
  setPageAnalysis: (analysis) => set({ pageAnalysis: analysis }),
  addChatMessage: (role, content) => 
    set((state) => ({
      chatHistory: [
        ...state.chatHistory,
        { role, content, timestamp: new Date() }
      ]
    })),
  clearChatHistory: () => set({ chatHistory: [] })
}));