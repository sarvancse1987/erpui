// ToastContext.tsx
import React, { createContext, useRef, ReactNode } from 'react';
import { Toast } from 'primereact/toast';

// Fix: allow Toast | null in RefObject
export const ToastContext = createContext<React.RefObject<Toast | null> | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toastRef = useRef<Toast | null>(null); // correctly typed

  return (
    <ToastContext.Provider value={toastRef}>
      <Toast ref={toastRef} />
      {children}
    </ToastContext.Provider>
  );
};
