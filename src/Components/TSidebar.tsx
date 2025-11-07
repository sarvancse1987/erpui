import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';

interface TSidebarProps {
    visible: boolean;
    onHide: () => void;
    children: React.ReactNode;
    initialPosition?: 'left' | 'right'; // optional prop to dynamically set initial position
    style?: React.CSSProperties;
    fullScreen?: boolean; // Optional full-screen prop
}

const TSidebar: React.FC<TSidebarProps> = ({ visible, onHide, children, initialPosition = 'left', style, fullScreen = false }) => {
    // Manage position dynamically
    const [position, setPosition] = useState<'left' | 'right'>(initialPosition);

    // Toggle position dynamically (you can customize this logic based on your needs)
    const togglePosition = () => {
        setPosition(position === 'left' ? 'right' : 'left');
    };

    return (
        <>
            <Sidebar
                visible={visible}
                position={position}
                onHide={onHide}
                style={style || { width: fullScreen ? '100vw' : '30vw' }}
                fullScreen={fullScreen}
            >
                {children}
            </Sidebar>
        </>
    );
};

export default TSidebar;
