import React, { createContext, useState } from 'react';
import { ThemeContextProps, ThemeProviderProps } from './layoutprops';

export const ThemeContext = createContext<ThemeContextProps>({
    theme: 'lara-light-indigo',
    changeTheme: () => { }
});

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState('lara-light-indigo');

    const changeTheme = (newTheme: string) => {
        const themeLink = document.getElementById('theme-css') as HTMLLinkElement | null;

        if (themeLink) {
            // Update the href to the new theme CSS file path
            themeLink.href = `/themes/${newTheme}/theme.css`;
        } else {
            // If link does not exist, create it
            const link = document.createElement('link');
            link.id = 'theme-css';
            link.rel = 'stylesheet';
            link.href = `/themes/${newTheme}/theme.css`;
            document.head.appendChild(link);
        }

        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
