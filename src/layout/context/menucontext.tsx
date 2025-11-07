import { useState, createContext, useCallback } from 'react';
import { ChildContainerProps, MenuContextProps } from '../layoutprops';

export const MenuContext = createContext<MenuContextProps>({} as MenuContextProps);

export const MenuProvider = ({ children }: ChildContainerProps) => {
  const [activeMenu, setActiveMenu] = useState('');
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = useCallback((menuKey: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuKey)
        ? prev.filter((key) => key !== menuKey)
        : [...prev, menuKey]
    );
  }, []);

  const isMenuOpen = useCallback(
    (menuKey: string) => expandedMenus.includes(menuKey),
    [expandedMenus]
  );

  const value: MenuContextProps = {
    activeMenu,
    setActiveMenu,
    toggleMenu,
    isMenuOpen,
    expandedMenus
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};
