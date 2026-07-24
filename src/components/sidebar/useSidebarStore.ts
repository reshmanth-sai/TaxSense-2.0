import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SidebarTheme = 'light' | 'dark' | 'system';
export type SidebarBehavior = 'pinned' | 'collapsed' | 'auto_hover';

interface SidebarState {
  isCollapsed: boolean;
  sidebarBehavior: SidebarBehavior;
  preferredCollapsedBehavior: 'collapsed' | 'auto_hover';
  collapsedGroups: Record<string, boolean>;
  favorites: string[];
  recentlyVisited: string[];
  activeWorkspace: string;
  theme: SidebarTheme;
  isSearchOpen: boolean;
  
  // Actions
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setSidebarBehavior: (behavior: SidebarBehavior) => void;
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
      // Keep the rail calm by default; desktop users can still pin it from the
      // header control when they need labels visible all the time.
      sidebarBehavior: 'auto_hover',
      preferredCollapsedBehavior: 'auto_hover',
      collapsedGroups: {},
      favorites: [],
      recentlyVisited: [],
      activeWorkspace: 'TaxSense',
      theme: 'dark',
      isSearchOpen: false,

      setSidebarBehavior: (behavior) => set((state) => {
        const isCollapsed = behavior !== 'pinned';
        const preferredCollapsedBehavior = isCollapsed ? behavior : state.preferredCollapsedBehavior;
        return {
          sidebarBehavior: behavior,
          isCollapsed,
          preferredCollapsedBehavior
        };
      }),

      toggleCollapsed: () => set((state) => {
        if (state.sidebarBehavior === 'pinned') {
          return {
            sidebarBehavior: state.preferredCollapsedBehavior,
            isCollapsed: true
          };
        } else {
          return {
            sidebarBehavior: 'pinned',
            isCollapsed: false
          };
        }
      }),

      setCollapsed: (collapsed) => set((state) => {
        if (collapsed) {
          return {
            sidebarBehavior: state.preferredCollapsedBehavior,
            isCollapsed: true
          };
        } else {
          return {
            sidebarBehavior: 'pinned',
            isCollapsed: false
          };
        }
      }),

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
        sidebarBehavior: state.sidebarBehavior,
        preferredCollapsedBehavior: state.preferredCollapsedBehavior,
        collapsedGroups: state.collapsedGroups,
        favorites: state.favorites,
        recentlyVisited: state.recentlyVisited,
        activeWorkspace: state.activeWorkspace,
        theme: state.theme,
      }),
    }
  )
);
