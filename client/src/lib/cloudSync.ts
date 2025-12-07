/**
 * Cloud Sync Utility
 * Provides cross-device data persistence using localStorage with backup/restore
 * Data is stored locally and can be exported/imported across devices
 */

const SYNC_KEY = 'convivencia_cloud_sync';
const BACKUP_KEY = 'convivencia_backup';

interface SyncData {
  timestamp: number;
  data: {
    evaluations: any[];
    sessions: any[];
    tags: any[];
    settings: any[];
  };
}

export const cloudSync = {
  /**
   * Save data to cloud (localStorage)
   */
  save: (data: any) => {
    try {
      const syncData: SyncData = {
        timestamp: Date.now(),
        data,
      };
      localStorage.setItem(SYNC_KEY, JSON.stringify(syncData));
      // Also keep a backup
      localStorage.setItem(BACKUP_KEY, JSON.stringify(syncData));
      return true;
    } catch (error) {
      console.error('Error saving to cloud:', error);
      return false;
    }
  },

  /**
   * Load data from cloud (localStorage)
   */
  load: () => {
    try {
      const syncData = localStorage.getItem(SYNC_KEY);
      if (syncData) {
        const parsed = JSON.parse(syncData) as SyncData;
        return parsed.data;
      }
      return null;
    } catch (error) {
      console.error('Error loading from cloud:', error);
      return null;
    }
  },

  /**
   * Export data as JSON file
   */
  exportAsJSON: (data: any, filename: string = 'convivencia_backup.json') => {
    try {
      const syncData: SyncData = {
        timestamp: Date.now(),
        data,
      };
      const json = JSON.stringify(syncData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exporting JSON:', error);
      return false;
    }
  },

  /**
   * Import data from JSON file
   */
  importFromJSON: async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const syncData = JSON.parse(content) as SyncData;
            cloudSync.save(syncData.data);
            resolve(syncData.data);
          } catch (error) {
            reject(new Error('Invalid JSON file'));
          }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Get last sync timestamp
   */
  getLastSyncTime: () => {
    try {
      const syncData = localStorage.getItem(SYNC_KEY);
      if (syncData) {
        const parsed = JSON.parse(syncData) as SyncData;
        return new Date(parsed.timestamp);
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Clear all sync data
   */
  clear: () => {
    try {
      localStorage.removeItem(SYNC_KEY);
      localStorage.removeItem(BACKUP_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing sync data:', error);
      return false;
    }
  },

  /**
   * Restore from backup
   */
  restoreFromBackup: () => {
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        localStorage.setItem(SYNC_KEY, backup);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  },

  /**
   * Check if data exists
   */
  hasData: () => {
    return localStorage.getItem(SYNC_KEY) !== null;
  },

  /**
   * Get storage size
   */
  getStorageSize: () => {
    try {
      const syncData = localStorage.getItem(SYNC_KEY);
      if (syncData) {
        return new Blob([syncData]).size;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  },
};
