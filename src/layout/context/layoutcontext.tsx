'use client';

import React, { useState, createContext, useContext } from 'react';
import { ChildContainerProps, defaultContext, defaultLayoutConfig, defaultLayoutState, LayoutConfig, LayoutContextProps, LayoutState } from '../layoutprops';


// Context
export const LayoutContext = createContext<LayoutContextProps>(defaultContext);

// Provider
export const LayoutProvider = ({ children }: ChildContainerProps) => {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(defaultLayoutConfig);
  const [layoutState, setLayoutState] = useState<LayoutState>(defaultLayoutState);

  const isOverlay = () => layoutConfig.menuMode === 'overlay';
  const isDesktop = () => typeof window !== 'undefined' && window.innerWidth > 991;

  const onMenuToggle = () => {
    const isOverlay = layoutConfig.menuMode === 'overlay';
    const isDesktop = typeof window !== 'undefined' && window.innerWidth > 991;

    setLayoutState(prev => {
      const newState = isOverlay
        ? {
          ...prev,
          overlayMenuActive: !prev.overlayMenuActive,
          staticMenuMobileActive: false,
          staticMenuDesktopInactive: false
        }
        : isDesktop
          ? {
            ...prev,
            staticMenuDesktopInactive: !prev.staticMenuDesktopInactive,
            overlayMenuActive: false,
            staticMenuMobileActive: false
          }
          : {
            ...prev,
            staticMenuMobileActive: !prev.staticMenuMobileActive,
            overlayMenuActive: false,
            staticMenuDesktopInactive: false
          };
      console.log('New layout state:', newState);
      return newState;
    });
  };

  const showProfileSidebar = () => {
    setLayoutState(prev => ({ ...prev, profileSidebarVisible: !prev.profileSidebarVisible }));
  };

  return (
    <LayoutContext.Provider
      value={{
        layoutConfig,
        setLayoutConfig,
        layoutState,
        setLayoutState,
        onMenuToggle,
        showProfileSidebar
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

// Optional: Hook for consuming context
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
