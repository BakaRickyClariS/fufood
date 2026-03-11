import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TourStep =
  | 'LOGIN'
  | 'CREATE_GROUP'
  | 'PROFILE'
  | 'AI_SCAN'
  | 'INVENTORY_WARNING'
  | 'RECIPE_SYNC'
  | 'NOTIFICATIONS'
  | 'COMPLETED';

interface TourState {
  isActive: boolean;
  currentStep: TourStep;
  startTour: () => void;
  setStep: (step: TourStep) => void;
  finishTour: () => void;
  resetTour: () => void;
  restartTour: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      isActive: false,
      currentStep: 'LOGIN',
      startTour: () => set({ isActive: true, currentStep: 'CREATE_GROUP' }),
      setStep: (step: TourStep) => set({ currentStep: step }),
      finishTour: () => set({ isActive: false, currentStep: 'COMPLETED' }),
      resetTour: () => set({ isActive: false, currentStep: 'LOGIN' }),
      restartTour: () => set({ isActive: true, currentStep: 'CREATE_GROUP' }),
    }),
    {
      name: 'fufood-tour-state',
      // Optionally store in localStorage (by default zustand persist does)
    },
  ),
);
