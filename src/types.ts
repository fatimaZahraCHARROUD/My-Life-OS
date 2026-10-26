export type PageId = string;
export type CategoryId = string;

export interface Page {
  id: PageId;
  title: string;
   icon?: string;
   coverPositionY?: number;
    coverUrl?: string; // NEW: For the banner image
  isPinned?: boolean; // NEW: For pinning
  isTabPinned?: boolean;
  parentId: PageId | null;
  /** @deprecated — kept optional for backward compat after migration */
  categoryId?: CategoryId;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
  /** BlockNote block array */
  content: unknown[];
  /** Set once during migration so we don't re-migrate */
  migratedFrom?: CategoryId;
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  order: number;
  createdAt: number;
}

export interface WorkspaceState {
  categories: Category[];
  pages: Page[];
  expanded: Record<string, boolean>;
  activePageId: PageId | null;
  sidebarCollapsed: boolean;
  hasSeenWelcome: boolean;
}