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
  lastSyncTime: number;
}

export interface LocalStorage {
  bookmarks: Bookmark[];
  lastSyncHash: string;
  syncError: boolean;
}

export type MessageType =
  | { type: 'SYNC_COMPLETE' }
  | { type: 'SYNC_NOW' };

export type Theme = 'neutral';
