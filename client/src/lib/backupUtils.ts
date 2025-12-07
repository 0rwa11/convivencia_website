import { EvaluationRecord } from '@/contexts/EvaluationContext';

const BACKUP_STORAGE_KEY = 'convivencia_backups';
const MAX_BACKUPS = 10;

export interface Backup {
  id: string;
  timestamp: string;
  name: string;
  recordCount: number;
  data: EvaluationRecord[];
}

export function createBackup(records: EvaluationRecord[], name?: string): Backup {
  const backup: Backup = {
    id: `backup-${Date.now()}`,
    timestamp: new Date().toISOString(),
    name: name || `Respaldo ${new Date().toLocaleDateString('es-ES')}`,
    recordCount: records.length,
    data: records,
  };

  // Get existing backups
  const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
  let backups: Backup[] = stored ? JSON.parse(stored) : [];

  // Add new backup
  backups.unshift(backup);

  // Keep only last MAX_BACKUPS
  backups = backups.slice(0, MAX_BACKUPS);

  localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));
  return backup;
}

export function getBackups(): Backup[] {
  const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function restoreBackup(backupId: string): EvaluationRecord[] | null {
  const backups = getBackups();
  const backup = backups.find(b => b.id === backupId);
  if (backup) {
    localStorage.setItem('convivencia_evaluations', JSON.stringify(backup.data));
    return backup.data;
  }
  return null;
}

export function deleteBackup(backupId: string): void {
  const backups = getBackups();
  const filtered = backups.filter(b => b.id !== backupId);
  localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(filtered));
}

export function exportBackupAsJSON(backup: Backup): void {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `respaldo_${backup.timestamp.split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

export function importBackupFromJSON(file: File): Promise<Backup | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string) as Backup;
        if (backup.data && Array.isArray(backup.data)) {
          // Create new backup with imported data
          const newBackup = createBackup(backup.data, `Importado: ${backup.name}`);
          resolve(newBackup);
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error('Error importing backup', error);
        resolve(null);
      }
    };
    reader.readAsText(file);
  });
}

export function autoBackup(records: EvaluationRecord[]): void {
  const lastBackupTime = localStorage.getItem('convivencia_last_backup_time');
  const now = Date.now();
  const oneHourInMs = 60 * 60 * 1000;

  if (!lastBackupTime || now - parseInt(lastBackupTime) > oneHourInMs) {
    createBackup(records, `Respaldo Automático ${new Date().toLocaleTimeString('es-ES')}`);
    localStorage.setItem('convivencia_last_backup_time', now.toString());
  }
}
