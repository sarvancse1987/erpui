import { Dispatch, ReactNode, SetStateAction } from "react";

export interface LayoutState {
    overlayMenuActive: boolean;
    staticMenuMobileActive: boolean;
    menuHoverActive: boolean;
    profileSidebarVisible: boolean;
    staticMenuDesktopInactive?: boolean;
    configSidebarVisible: boolean;
}

export interface AppTopbarRef {
    menubutton?: HTMLButtonElement | null;
    topbarmenubutton?: HTMLButtonElement | null;
    topbarmenu?: HTMLDivElement | null;
}

export interface AppTopbarRef {
    menubutton?: HTMLButtonElement | null;
    topbarmenu?: HTMLDivElement | null;
    topbarmenubutton?: HTMLButtonElement | null;
}

export interface MenuItem {
    label: string;
    to?: string;
    url?: string;
    icon?: string;
    class?: string;
    badgeClass?: string;
    disabled?: boolean;
    command?: (event: any) => void;
    items?: MenuItem[];
    visible?: boolean;
    target?: string;
    replaceUrl?: boolean;
}

export interface AppMenuItemProps {
    item: MenuItem;
    index: number;
    parentKey?: string;
    root?: boolean;
    className?: string;
}

export interface AppMenuItem {
    label: string;
    icon?: string;
    to?: string;
    url?: string;
    target?: string;
    badge?: string;
    class?: string;
    preventExact?: boolean;
    seperator?: boolean;
    items?: AppMenuItem[];
}

export interface ThemeProviderProps {
    children: ReactNode;
}


export interface ThemeContextProps {
    theme: string;
    changeTheme: (newTheme: string) => void;
}

export interface ChildContainerProps {
    children: ReactNode;
    className?: string;
    isProtected?: boolean;
    requiresAuth?: boolean;
}

export interface MenuContextProps {
    activeMenu: string;
    setActiveMenu: (menuKey: string) => void;
    toggleMenu: (menuKey: string) => void;
    isMenuOpen: (menuKey: string) => boolean;
    expandedMenus: string[]; // Required here since we use it in the provider
}

export interface AppBreadcrumbProps {
    className?: string;
}

export interface Breadcrumb {
    labels?: string[];
    to?: string;
}

export interface BreadcrumbItem {
    label: string;
    to?: string;
    items?: BreadcrumbItem[];
}

export interface LayoutConfig {
    ripple: boolean;
    inputStyle: string;
    menuMode: string;
    colorScheme: string;
    theme: string;
    scale: number;
}

export interface ChildContainerProps {
    children: ReactNode;
    className?: string;
    isProtected?: boolean;
    requiresAuth?: boolean;
}

export interface LayoutContextProps {
    layoutConfig: LayoutConfig;
    setLayoutConfig: Dispatch<SetStateAction<LayoutConfig>>;
    layoutState: LayoutState;
    setLayoutState: Dispatch<SetStateAction<LayoutState>>;
    onMenuToggle: () => void;
    showProfileSidebar: () => void;
}

export interface AppConfigProps {
    simple?: boolean;
}

export const defaultLayoutConfig: LayoutConfig = {
    ripple: false,
    inputStyle: 'outlined',
    menuMode: 'static',
    colorScheme: 'light',
    theme: 'lara-light-indigo',
    scale: 14
};

export const defaultLayoutState: LayoutState = {
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false
};

export const defaultContext: LayoutContextProps = {
    layoutConfig: defaultLayoutConfig,
    setLayoutConfig: () => { },
    layoutState: defaultLayoutState,
    setLayoutState: () => { },
    onMenuToggle: () => { },
    showProfileSidebar: () => { }
};