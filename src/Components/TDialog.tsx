// ReusableDialog.tsx
import React from 'react';
import { Dialog } from 'primereact/dialog';

interface ReusableDialogProps {
    header: string;
    visible: boolean;
    onHide: () => void;
    footer?: React.ReactNode;
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string; 
}

const TDialog: React.FC<ReusableDialogProps> = ({ header, visible, onHide, footer, children, style,className }) => {
    return (
        <Dialog
            
            header={header} 
            visible={visible}
            style={style || { width: '63vw' }}
            onHide={onHide}
            footer={footer}
            className={className}
        >
            {children}
        </Dialog>
    );
};

export default TDialog;
