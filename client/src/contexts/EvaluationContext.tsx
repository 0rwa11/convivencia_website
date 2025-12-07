import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveToCloud, loadFromCloud, setupCrossTabSync } from '@/lib/cloudSyncService';

export interface EvaluationRecord {
  id: string;
  sessionNumber: number;
  date: string;
  groupName: string;
  facilitator: string;
  
  // ANTES
  beforeGrouping: string;
  beforeIsolation: string;
  beforeTensions: string;
  beforeCommunication: string;
  beforeMixedInteractions: number;
  
  // DURANTE
  duringParticipation: string;
  duringRespect: string;
  duringOpenness: string;
  duringLaughter: string;
  duringMixedInteractions: string;
  
  // DESPUÉS
  afterGrouping: string;
  afterMixedInteractions: number;
  afterStereotypes: string;
  
  notes: string;
}

interface EvaluationContextType {
  records: EvaluationRecord[];
  addRecord: (record: EvaluationRecord) => void;
  updateRecord: (id: string, record: EvaluationRecord) => void;
  deleteRecord: (id: string) => void;
  getRecordsByGroup: (groupName: string) => EvaluationRecord[];
  getAllGroups: () => string[];
  getGroupStats: (groupName: string) => any;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

const STORAGE_KEY = 'convivencia_evaluations';

// Initialize records from localStorage or cloud sync
const initializeRecords = (): EvaluationRecord[] => {
  try {
    // Try localStorage first (fastest)
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load evaluations from storage', e);
  }
  return [];
};

export function EvaluationProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<EvaluationRecord[]>(initializeRecords);

  // Save to localStorage and cloud sync whenever records change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    // Auto-sync to cloud
    saveToCloud({
      records,
      sessions: [],
      calendar: [],
    });
  }, [records]);

  // Setup cross-tab/device sync
  useEffect(() => {
    const unsubscribe = setupCrossTabSync((syncedData) => {
      if (syncedData?.evaluations) {
        setRecords(syncedData.evaluations);
      }
    });
    return unsubscribe;
  }, []);

  // Load from cloud on mount
  useEffect(() => {
    loadFromCloud().then((cloudData) => {
      if (cloudData?.evaluations && cloudData.evaluations.length > records.length) {
        setRecords(cloudData.evaluations);
      }
    });
  }, []);

  const addRecord = (record: EvaluationRecord) => {
    const updated = [...records, record];
    setRecords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateRecord = (id: string, record: EvaluationRecord) => {
    const updated = records.map(r => (r.id === id ? record : r));
    setRecords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getRecordsByGroup = (groupName: string) => {
    const currentRecords = localStorage.getItem(STORAGE_KEY) 
      ? JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      : records;
    return currentRecords.filter((r: EvaluationRecord) => r.groupName === groupName);
  };

  const getAllGroups = () => {
    const currentRecords = localStorage.getItem(STORAGE_KEY)
      ? JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      : records;
    return Array.from(new Set(currentRecords.map((r: EvaluationRecord) => r.groupName))).sort() as string[];
  };

  const getGroupStats = (groupName: string) => {
    const currentRecords = localStorage.getItem(STORAGE_KEY)
      ? JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      : records;
    const groupRecords = currentRecords.filter((r: EvaluationRecord) => r.groupName === groupName);
    if (groupRecords.length === 0) {
      return null;
    }

    const avgBeforeMixed = groupRecords.length > 0 ? Math.round(
      groupRecords.reduce((sum: number, r: EvaluationRecord) => sum + r.beforeMixedInteractions, 0) / groupRecords.length
    ) : 0;

    const avgAfterMixed = groupRecords.length > 0 ? Math.round(
      groupRecords.reduce((sum: number, r: EvaluationRecord) => sum + r.afterMixedInteractions, 0) / groupRecords.length
    ) : 0;

    const improvement = avgBeforeMixed > 0
      ? Math.round(((avgAfterMixed - avgBeforeMixed) / avgBeforeMixed) * 100)
      : 0;

    const respectLevels = {
      Alto: groupRecords.filter((r: EvaluationRecord) => r.duringRespect === 'Alto').length,
      Medio: groupRecords.filter((r: EvaluationRecord) => r.duringRespect === 'Medio').length,
      Bajo: groupRecords.filter((r: EvaluationRecord) => r.duringRespect === 'Bajo').length,
    };

    const avgParticipation = groupRecords.length > 0 ? Math.round(
      groupRecords.reduce((sum: number, r: EvaluationRecord) => {
        const percent = parseInt(r.duringParticipation.replace('%', '').split('-')[0]) || 0;
        return sum + percent;
      }, 0) / groupRecords.length
    ) : 0;

    const stereotypeReduction = groupRecords.filter((r: EvaluationRecord) => r.afterStereotypes === 'Disminuyeron').length > 0;

    return {
      groupName,
      totalSessions: groupRecords.length,
      avgBeforeMixed,
      avgAfterMixed,
      improvement,
      respectLevels,
      avgParticipation,
      stereotypeReduction,
      overallScore: Math.max(0, (avgParticipation / 10) + (improvement / 100) + (stereotypeReduction ? 1 : 0)),
    };
  };

  // Ensure records are always synced with localStorage
  const syncedRecords = localStorage.getItem(STORAGE_KEY)
    ? JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    : records;

  return (
    <EvaluationContext.Provider
      value={{
        records: syncedRecords,
        addRecord,
        updateRecord,
        deleteRecord,
        getRecordsByGroup,
        getAllGroups,
        getGroupStats,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
}

export function useEvaluation() {
  const context = useContext(EvaluationContext);
  if (context === undefined) {
    throw new Error('useEvaluation must be used within EvaluationProvider');
  }
  // Ensure we always get fresh data from localStorage
  const freshRecords = localStorage.getItem(STORAGE_KEY)
    ? JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    : context.records;
  
  return {
    ...context,
    records: freshRecords,
  };
}
