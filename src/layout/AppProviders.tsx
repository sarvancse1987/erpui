import React, { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import storeabc from '../store/storeabc';
import { AuthProvider } from '../auth/AuthProvider';
import { LoaderProvider } from '../components/LoaderContext';
import { ToastProvider } from '../components/ToastContext';
import { LayoutProvider } from './context/layoutcontext';

interface AppProvidersProps {
    children: ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    return (
        <ReduxProvider store={storeabc}>
            {/* <ThemeProvider> */}
            <AuthProvider>
                <LoaderProvider>
                    <ToastProvider>
                        <LayoutProvider>
                            {children}
                        </LayoutProvider>
                    </ToastProvider>
                </LoaderProvider>
            </AuthProvider>
            {/* </ThemeProvider> */}
        </ReduxProvider>
    );
};

export default AppProviders;
