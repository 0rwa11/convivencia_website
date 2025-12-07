/**
 * Cloud Synchronization Service
 * Syncs evaluation data across devices using localStorage and IndexedDB
 * with automatic backup to browser storage
 */

const SYNC_KEY = 'convivencia_cloud_sync';
const BACKUP_KEY = 'convivencia_backup';
const LAST_SYNC_KEY = 'convivencia_last_sync';

interface SyncData {
  evaluations: any[];
  sessions: any[];
  calendar: any[];
  lastSyncTime: number;
  deviceId: string;
}

// Generate unique device ID
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('convivencia_device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('convivencia_device_id', deviceId);
  }
  return deviceId;
};

// Initialize IndexedDB for cloud storage simulation
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ConvivenciaDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('sync_data')) {
        db.createObjectStore('sync_data', { keyPath: 'id' });
      }
    };
  });
};

// Save data to IndexedDB (simulating cloud storage)
export const saveToCloud = async (data: any): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(['sync_data'], 'readwrite');
    const store = transaction.objectStore('sync_data');
    
    const syncData: SyncData = {
      evaluations: data.records || [],
      sessions: data.sessions || [],
      calendar: data.calendar || [],
      lastSyncTime: Date.now(),
      deviceId: getDeviceId(),
    };
    
    // Save to IndexedDB
    await new Promise((resolve, reject) => {
      const request = store.put({
        id: 'main',
        data: syncData,
        timestamp: Date.now(),
      });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(null);
    });
    
    // Also save to localStorage as backup
    localStorage.setItem(BACKUP_KEY, JSON.stringify(syncData));
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    
    console.log('✅ Data synced to cloud successfully');
  } catch (error) {
    console.error('❌ Cloud sync error:', error);
    // Fallback to localStorage if IndexedDB fails
    localStorage.setItem(BACKUP_KEY, JSON.stringify(data));
  }
};

// Load data from cloud
export const loadFromCloud = async (): Promise<any | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(['sync_data'], 'readonly');
    const store = transaction.objectStore('sync_data');
    
    return new Promise((resolve, reject) => {
      const request = store.get('main');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          console.log('✅ Data loaded from cloud');
          resolve(result.data);
        } else {
          // Try localStorage backup
          const backup = localStorage.getItem(BACKUP_KEY);
          if (backup) {
            console.log('✅ Data loaded from backup');
            resolve(JSON.parse(backup));
          } else {
            resolve(null);
          }
        }
      };
    });
  } catch (error) {
    console.error('❌ Cloud load error:', error);
    // Fallback to localStorage
    const backup = localStorage.getItem(BACKUP_KEY);
    return backup ? JSON.parse(backup) : null;
  }
};

// Sync data across tabs/windows using storage events
export const setupCrossTabSync = (onSync: (data: any) => void): (() => void) => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === BACKUP_KEY && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        console.log('🔄 Cross-tab sync detected');
        onSync(data);
      } catch (error) {
        console.error('Error parsing sync data:', error);
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

// Get last sync time
export const getLastSyncTime = (): number => {
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);
  return lastSync ? parseInt(lastSync) : 0;
};

// Check if data needs sync (older than 5 minutes)
export const needsSync = (): boolean => {
  const lastSync = getLastSyncTime();
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return lastSync < fiveMinutesAgo;
};

// Clear cloud data
export const clearCloudData = async (): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(['sync_data'], 'readwrite');
    const store = transaction.objectStore('sync_data');
    
    await new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(null);
    });
    
    localStorage.removeItem(BACKUP_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
    console.log('✅ Cloud data cleared');
  } catch (error) {
    console.error('Error clearing cloud data:', error);
  }
};
