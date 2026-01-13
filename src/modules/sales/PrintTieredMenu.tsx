import React, { useRef, useState } from 'react';
import { TieredMenu } from 'primereact/tieredmenu';
import { Button } from 'primereact/button';
import { SaleModel } from '../../models/sale/SaleModel';
import apiService from '../../services/apiService';
import { ProgressSpinner } from 'primereact/progressspinner';

interface PrintMenuProps {
    row: SaleModel;
}

export const PrintTieredMenu: React.FC<PrintMenuProps> = ({ row }) => {
    const menu = useRef<TieredMenu>(null);
    const [loading, setLoading] = useState(false);

    // Normal Bill
    const handlePrintNormal = async (data: SaleModel) => {
        try {
            setLoading(true); // show loader
            const pdfBlob = await apiService.getPdf(`/Sale/sale-bill/${data.saleId}`);

            if (!pdfBlob || pdfBlob.size === 0) {
                console.error("PDF is empty!");
                return;
            }

            const url = URL.createObjectURL(pdfBlob);
            window.open(url);
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        } catch (error) {
            console.error("Error fetching PDF:", error);
        } finally {
            setLoading(false); // hide loader
        }
    };

    // E-Way Bill
    const handlePrintEWay = async (data: SaleModel) => {
        try {
            setLoading(true);
            const pdfBlob = await apiService.getPdf(`/Sale/sale-ewaybill/${data.saleId}`);

            if (!pdfBlob || pdfBlob.size === 0) {
                console.error("PDF is empty!");
                return;
            }

            const url = URL.createObjectURL(pdfBlob);
            window.open(url);
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        } catch (error) {
            console.error("Error fetching PDF:", error);
        } finally {
            setLoading(false);
        }
    };

    // Menu items — pass row using arrow function
    const items = [
        { label: 'Normal Bill', icon: 'pi pi-file', command: () => handlePrintNormal(row) },
        { label: 'E-Way Bill', icon: 'pi pi-file-pdf', command: () => handlePrintEWay(row) }
    ];

    return (
        <>
            {loading && (
                <div className="pdf-loader-overlay">
                    <ProgressSpinner />
                </div>
            )}

            <TieredMenu model={items} popup ref={menu} />
            <Button
                icon="pi pi-print"
                className="p-button-sm p-button-text p-button-info"
                tooltip="Print Bill"
                tooltipOptions={{ position: 'top' }}
                style={{ width: '25px', height: '25px', padding: '0' }}
                onClick={(e) => menu.current?.toggle(e)} // open menu
            />
        </>
    );
};
