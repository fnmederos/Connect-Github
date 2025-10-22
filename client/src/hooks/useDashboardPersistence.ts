import { useCallback } from 'react';

const STORAGE_KEY = 'dashboard_state';

export interface DashboardState {
  selectedDate: string;
  selectedVehicleIds: string[];
  assignmentRows: Record<string, Array<{ id: string; role: string; employeeId: string; time: string }>>;
  vehicleComments: Record<string, string>;
  loadingStatuses: Record<string, string>;
  depotAssignments: Record<string, any>;
  depotSupervisor: string;
}

export function useDashboardPersistence() {
  const saveState = useCallback((state: DashboardState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving dashboard state:', error);
    }
  }, []);

  const loadState = useCallback((): DashboardState | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading dashboard state:', error);
    }
    return null;
  }, []);

  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing dashboard state:', error);
    }
  }, []);

  return { saveState, loadState, clearState };
}
