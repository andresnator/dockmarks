export interface Bookmark {
  id: string;
  name: string;
  url: string;
  description?: string;
  logo?: string;
  section: string;
  tags?: string[];
}

export interface SyncStorage {
  jsonUrl: string;
  theme: 'neutral' | 'terminal';
  lastSyncTime: number;
}

export interface LocalStorage {
  bookmarks: Bookmark[];
  lastSyncHash: string;
  syncError: boolean;
  syncErrorTime: number;
}

export type MessageType =
  | { type: 'SYNC_COMPLETE' }
  | { type: 'SYNC_NOW' };

export type Theme = 'neutral' | 'terminal';
