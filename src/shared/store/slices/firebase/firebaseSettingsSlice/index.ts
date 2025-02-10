import { IFirebaseSettingsSlice } from "@/shared/types/index";
import {
  FirebaseApp,
  FirebaseOptions,
  getApps,
  initializeApp,
  getApp,
} from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { StateCreator } from "zustand";

export const firebaseSettingsSlice: StateCreator<
  IFirebaseSettingsSlice,
  [["zustand/immer", never]],
  [],
  IFirebaseSettingsSlice
> = (set) => {
  const initializeFirebase = (config: FirebaseOptions, appName?: string) => {
    const name = appName || "[DEFAULT]";
    const existingApps = getApps();

    let firebaseApp: FirebaseApp;

    if (existingApps.length > 0) {
      firebaseApp = getApp(name); // Используем существующий
    } else {
      firebaseApp = initializeApp(config, name); // Инициализируем новый
    }

    const firestore = getFirestore(firebaseApp);

    set({ firebaseApp, firestore });

    return firebaseApp;
  };

  return {
    firestore: undefined,
    firebaseApp: undefined,
    setFirestore: (newFirestore: Firestore | undefined) => {
      set({ firestore: newFirestore });
    },
    initializeFirebase,
  };
};
