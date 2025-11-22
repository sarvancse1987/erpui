import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { RadioButton } from "primereact/radiobutton";
import { InputText } from "primereact/inputtext";
import { SupplierModel } from "../../models/supplier/SupplierModel";
import '../../asset/style/SupplierSelector.css';
import { CustomerModel } from "../../models/customer/CustomerModel";

interface CustomerSelectorProps {
    customers: CustomerModel[];
    selectedCustomerId: number | null;
    onSelect: (supplier: CustomerModel) => void;
    isValid?: boolean;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
    customers,
    selectedCustomerId,
    onSelect,
    isValid
}) => {
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerModel | null>(null);
    const [searchText, setSearchText] = useState("");
    const [filteredSuppliers, setFilteredSuppliers] = useState<CustomerModel[]>([]);
    const [showTable, setShowTable] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter suppliers based on search text
    useEffect(() => {
        if (searchText.trim() === "") {
            setFilteredSuppliers([]);
            setShowTable(false); // hide if search text is empty
        } else {
            const query = searchText.toLowerCase();
            const filtered = customers.filter(
                (s) =>
                    s.customerName.toLowerCase().includes(query) ||
                    s.phone?.includes(query)
            );
            setFilteredSuppliers(filtered);
            // Only show if user is typing, not after selection
            if (!selectedCustomer || selectedCustomer.customerName !== searchText) {
                setShowTable(filtered.length > 0);
            }
        }
    }, [searchText, customers]);

    useEffect(() => {
        if (selectedCustomerId) {
            const match = customers.find(
                (s) => s.customerId === selectedCustomerId
            );
            setSelectedCustomer(match || null);
            setSearchText(match?.customerName || "");
        } else {
            setSelectedCustomer(null);
            setSearchText("");
        }
    }, [selectedCustomerId, customers]);

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

    const handleSelect = (customer: CustomerModel) => {
        setSelectedCustomer(customer);
        setSearchText(customer.customerName);
        setShowTable(false);
        onSelect(customer);
    };

    const radioBodyTemplate = (rowData: CustomerModel) => (
        <RadioButton
            value={rowData.customerId}
            onChange={() => handleSelect(rowData)}
            checked={selectedCustomer?.customerId === rowData.customerId}
        />
    );

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <InputText
                className={`w-full mt-1 ${isValid ? "p-invalid" : ""}`}
                placeholder="Search Customer"
                value={searchText}
                onChange={(e) => {
                    setSearchText(e.target.value); 
                }}
                onFocus={() => {
                    if (searchText.trim() !== "") {
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
                            <Column field="customerName" header="Supplier Name" style={{ minWidth: '200px' }} />
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
