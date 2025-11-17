import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { RadioButton } from "primereact/radiobutton";
import { InputText } from "primereact/inputtext";
import { SupplierModel } from "../../models/supplier/SupplierModel";
import '../../asset/style/SupplierSelector.css';

interface SupplierSelectorProps {
    suppliers: SupplierModel[];
    selectedSupplierId: number | null;
    onSelect: (supplier: SupplierModel) => void;
    isValid?: boolean;
}

export const SupplierSelector: React.FC<SupplierSelectorProps> = ({
    suppliers,
    selectedSupplierId,
    onSelect,
    isValid
}) => {
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierModel | null>(
        suppliers.find((s) => s.supplierId === selectedSupplierId) || null
    );
    const [searchText, setSearchText] = useState("");
    const [filteredSuppliers, setFilteredSuppliers] = useState<SupplierModel[]>([]);
    const [showTable, setShowTable] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter suppliers based on search text
    useEffect(() => {
        if (searchText.trim() === "") {
            setFilteredSuppliers([]);
            setShowTable(false); // hide if search text is empty
        } else {
            const query = searchText.toLowerCase();
            const filtered = suppliers.filter(
                (s) =>
                    s.supplierName.toLowerCase().includes(query) ||
                    s.contactPerson?.toLowerCase().includes(query) ||
                    s.phone?.includes(query)
            );
            setFilteredSuppliers(filtered);
            // Only show if user is typing, not after selection
            if (!selectedSupplier || selectedSupplier.supplierName !== searchText) {
                setShowTable(filtered.length > 0);
            }
        }
    }, [searchText, suppliers]);

    // Handle clicking outside to close the table
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowTable(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (supplier: SupplierModel) => {
        setSelectedSupplier(supplier);
        setSearchText(supplier.supplierName);
        setShowTable(false);
        onSelect(supplier);
    };

    const radioBodyTemplate = (rowData: SupplierModel) => (
        <RadioButton
            value={rowData.supplierId}
            onChange={() => handleSelect(rowData)}
            checked={selectedSupplier?.supplierId === rowData.supplierId}
        />
    );

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <InputText
                className={`w-full mt-1 ${isValid ? "p-invalid" : ""}`}
                placeholder="Search Supplier"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={() => {
                    if (searchText.trim() !== "" && filteredSuppliers.length > 0) {
                        setShowTable(true);
                    }
                }}
            />

            {showTable && (
                <>
                    <div className="supplier-backdrop" onClick={() => setShowTable(false)} />
                    <div className="supplier-dropdown">
                        <DataTable
                            value={filteredSuppliers}
                            size="small"
                            responsiveLayout="scroll"
                            showHeaders
                            scrollable
                            className="p-datatable-sm p-datatable-striped"
                            tableStyle={{ width: '100%' }}
                        >
                            <Column header="Select" body={radioBodyTemplate} style={{ width: '60px' }} />
                            <Column field="supplierName" header="Supplier Name" style={{ minWidth: '200px' }} />
                            <Column field="contactPerson" header="Contact Person" style={{ minWidth: '150px' }} />
                            <Column field="phone" header="Phone" style={{ minWidth: '140px' }} />
                            <Column field="city" header="City" style={{ minWidth: '180px' }} />
                            <Column field="address" header="Address" style={{ minWidth: '180px' }} />
                        </DataTable>
                    </div>
                </>
            )}

        </div>
    );
};
