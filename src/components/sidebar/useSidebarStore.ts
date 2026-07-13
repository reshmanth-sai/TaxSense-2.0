import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SidebarTheme = 'light' | 'dark' | 'system';

interface SidebarState {
  isCollapsed: boolean;
  collapsedGroups: Record<string, boolean>;
  favorites: string[];
  recentlyVisited: string[];
  activeWorkspace: string;
  theme: SidebarTheme;
  isSearchOpen: boolean;
  
  // Actions
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleGroup: (groupName: string) => void;
  toggleFavorite: (pageName: string) => void;
  trackVisit: (pageName: string) => void;
  setWorkspace: (workspace: string) => void;
  setTheme: (theme: SidebarTheme) => void;
  setSearchOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      collapsedGroups: {},
      favorites: [],
      recentlyVisited: [],
      activeWorkspace: 'TaxSense-2.0',
      theme: 'dark',
      isSearchOpen: false,

      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      toggleGroup: (groupName) => set((state) => ({
        collapsedGroups: {
          ...state.collapsedGroups,
          [groupName]: !state.collapsedGroups[groupName]
        }
      })),
      toggleFavorite: (pageName) => set((state) => {
        const isFav = state.favorites.includes(pageName);
        return {
          favorites: isFav
            ? state.favorites.filter((f) => f !== pageName)
            : [...state.favorites, pageName]
        };
      }),
      trackVisit: (pageName) => set((state) => {
        // Keep a list of unique last 3 visited pages
        const filtered = state.recentlyVisited.filter((p) => p !== pageName);
        return {
          recentlyVisited: [pageName, ...filtered].slice(0, 3)
        };
      }),
      setWorkspace: (workspace) => set({ activeWorkspace: workspace }),
      setTheme: (theme) => set({ theme }),
      setSearchOpen: (open) => set({ isSearchOpen: open }),
    }),
    {
      name: 'taxsense_sidebar_store',
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        collapsedGroups: state.collapsedGroups,
        favorites: state.favorites,
        recentlyVisited: state.recentlyVisited,
        activeWorkspace: state.activeWorkspace,
        theme: state.theme,
      }),
    }
  )
);
