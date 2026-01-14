import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ShipmentModel } from "../../models/shipment/ShipmentModel";
import apiService from "../../services/apiService";
import { ShipmentTypeModel } from "../../models/shipment/ShipmentTypeModel";
import { InputNumber } from "primereact/inputnumber";
import { AutoComplete } from "primereact/autocomplete";
import { useToast } from "../../components/ToastService";

export interface SalesShipmentFormProps {
    isEditSidebar: boolean;
    onSave: (data: ShipmentModel) => void;
    onCancel: () => void;
    shipmentInfo?: ShipmentModel | null;
    isEditShipmentList?: boolean;
}

const SaleShipmentForm: React.FC<SalesShipmentFormProps> = ({
    isEditSidebar = false,
    onSave,
    onCancel,
    shipmentInfo,
    isEditShipmentList
}) => {
    const { showSuccess, showError } = useToast();

    const parseDate = (value: string | Date | null): Date | null => {
        if (!value) return null;

        // Already a valid Date
        if (value instanceof Date) return value;

        // ISO string (yyyy-MM-ddTHH:mm:ss)
        if (value.includes("T")) return new Date(value);

        // dd-MM-yyyy format
        const [day, month, year] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    const [formData, setFormData] = useState<ShipmentModel>({
        shipmentId: 0,
        shipmentDate: parseDate(new Date()),
        shipmentTypeId: null,
        address: "",
        vehicleNo: "",
        driver: "",
        remarks: "",
        saledId: 0,
        distance: null
    });
    const [shipmentTypes, setShipmentTypes] = useState<any[]>([]);
    const [validationErrors, setValidationErrors] = useState<any>({});
    const [filteredAddresses, setFilteredAddresses] = useState<string[]>([]);
    const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);

    const loadAllData = async () => {
        try {
            const shipmentType = await apiService.get("/ShipmentType");
            const shipmentTypeOptions = (shipmentType?.data ?? []).map((pt: ShipmentTypeModel) => ({
                label: pt.shipmentTypeName,
                value: pt.shipmentTypeId,
                text: pt.shipmentTypeValue,
                number: pt.shipmentValue,
            }));
            setShipmentTypes(shipmentTypeOptions ?? []);


            const defaultType = shipmentTypeOptions.find((x: any) => x.text === "OWN");

            if (defaultType) {
                setFormData(prev => ({
                    ...prev,
                    shipmentTypeId: defaultType.value,
                    shipmentTypeValue: defaultType.text,
                    vehicleNo: defaultType.number
                }));
            }

            const shipmentAddress = await apiService.get("/Shipment");
            if (shipmentAddress) {
                const activeAddresses = shipmentAddress
                    .filter((x: any) => x.isActive === true)
                    .map((x: any) => x.address)
                    .filter((x: string) => x && x.trim() !== "");
                setAddressSuggestions(activeAddresses)
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        loadAllData();
    }, [isEditShipmentList]);


    const handleChange = (field: keyof ShipmentModel, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveForm = async () => {
        let v: any = {};

        if (!formData.shipmentDate) v.shipmentDate = "Choose shipment date";
        if (!formData.shipmentTypeId) v.shipmentTypeId = "Choose shipment type";
        if (!formData.address) v.address = "Enter address";

        setValidationErrors(v);

        if (Object.keys(v).length === 0 && !isEditShipmentList) {
            onSave?.(formData);
        }

        if (isEditShipmentList) {
            const response = await apiService.put(`/Shipment/${formData.shipmentId}`, formData);
            if (response && response.status) {
                showSuccess("Shipment info updated successfully");
                 if (onCancel) onCancel();
            } else {
                showError(response?.error ?? "Shipment info save failed")
            }
        }
    };

    const onCancelSideBar = () => {
        if (onCancel) onCancel();
    };

    useEffect(() => {
        if (!shipmentInfo) return;

        setFormData(prev => ({
            ...prev,
            ...shipmentInfo,
            shipmentDate: parseDate(shipmentInfo.shipmentDate) ?? new Date()
        }));

    }, [shipmentInfo]);

    const onSetVechicle = (value: number) => {
        const shipment = shipmentTypes.find((x: any) => x.value === value);

        setFormData(prev => ({
            ...prev,
            vehicleNo: shipment?.number ?? ""
        }));
    };

    const searchAddress = (event: any) => {
        const query = event.query.toLowerCase();

        const filtered = addressSuggestions.filter(item =>
            item.toLowerCase().includes(query)
        );

        setFilteredAddresses(filtered);
    };

    const handleEnterKey = (e: any) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const currentTab = Number(e.target.getAttribute("tabindex"));
            const nextControl: any = document.querySelector(`[tabindex="${currentTab + 1}"]`);

            if (nextControl) nextControl.focus();
        }
    };

    return (
        <div className={`border border-gray-300 rounded-md p-1 ${isEditSidebar ? "max-w-[800px]" : "w-full"}`}>
            <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
                <legend className="text-sm font-semibold px-2 text-gray-700">
                    Add Shipment
                </legend>

                <div className="flex flex-wrap gap-3 p-1">

                    {/* Shipment Date */}
                    <div className="flex-1 min-w-[160px]">
                        <strong className="text-sm">
                            Shipment Date <span className="mandatory-asterisk">*</span>
                        </strong>
                        <Calendar
                            value={formData.shipmentDate}
                            onChange={(e) => { handleChange("shipmentDate", e.value ?? null); }}
                            dateFormat="dd-mm-yy"
                            showIcon
                            showButtonBar
                            className={`w-full mt-1 ${validationErrors.shipmentDate ? "p-invalid" : ""}`}
                            placeholder="Shipment date"
                        />
                        {validationErrors.shipmentDate && (
                            <span className="mandatory-error text-xs">{validationErrors.shipmentDate}</span>
                        )}
                    </div>

                    {/* Shipment Type */}
                    <div className="flex-1 min-w-[180px]">
                        <strong className="text-sm">
                            Shipment Type <span className="mandatory-asterisk">*</span>
                        </strong>
                        <Dropdown
                            value={formData.shipmentTypeId}
                            options={shipmentTypes}
                            onChange={(e) => {
                                handleChange("shipmentTypeId", e.value);
                                onSetVechicle(e.value);
                            }}
                            tabIndex={2}
                            onKeyDown={handleEnterKey}
                            placeholder="Select Type"
                            className={`w-full mt-1 text-sm ${validationErrors.shipmentTypeId ? "p-invalid" : ""}`}
                        />
                        {validationErrors.shipmentTypeId && (
                            <span className="mandatory-error text-xs">{validationErrors.shipmentTypeId}</span>
                        )}
                    </div>

                    <div className="min-w-[150px] flex-1">
                        <strong className="text-sm">Vehicle No</strong>
                        <InputText
                            value={formData.vehicleNo}
                            onChange={(e) => { handleChange("vehicleNo", e.target.value); }}
                            onKeyDown={handleEnterKey}
                            tabIndex={3}
                            className="w-full mt-1 text-sm" placeholder="Vechicle no"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 p-1">

                    {/* Address */}
                    <div className="flex-[2] min-w-[800px]">
                        <strong className="text-sm">
                            Address <span className="mandatory-asterisk">*</span>
                        </strong>

                        <AutoComplete
                            value={formData.address}
                            suggestions={filteredAddresses}
                            completeMethod={searchAddress}
                            onChange={(e) => handleChange("address", e.value)}
                            placeholder="Address"
                            className={`w-full mt-1 text-sm ${validationErrors.address ? "p-invalid" : ""}`}
                            inputClassName="w-full"
                            forceSelection={false}
                            dropdown
                            tabIndex={4}
                            onKeyDown={handleEnterKey}
                        />

                        {validationErrors.address && (
                            <span className="mandatory-error text-xs">{validationErrors.address}</span>
                        )}
                    </div>

                    {/* Driver Name */}
                    <div className="min-w-[150px] flex-1">
                        <strong className="text-sm">Driver Name</strong>
                        <InputText
                            value={formData.driver}
                            onChange={(e) => handleChange("driver", e.target.value)}
                            className="w-full mt-1 text-sm" placeholder="Driver name"
                            tabIndex={5}
                            onKeyDown={handleEnterKey}
                        />
                    </div>

                    <div className="min-w-[100px] flex-1">
                        <strong className="text-sm">Distance</strong>
                        <InputNumber
                            value={formData.distance}
                            onChange={(e) => handleChange("distance", e.value)}
                            placeholder="Distance"
                            className="w-full mt-1 text-sm"
                            tabIndex={6}
                            onKeyDown={handleEnterKey}
                        />
                    </div>
                </div>

                {isEditSidebar && (
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" label="Cancel" icon="pi pi-times-circle" style={{ color: 'red' }} outlined onClick={onCancelSideBar} className="p-button-sm custom-xs" />
                        <Button type="submit"
                            label="Save"
                            icon="pi pi-save"
                            severity="success"
                            className="p-button-sm custom-xs" onClick={handleSaveForm} tabIndex={7}
                            onKeyDown={handleEnterKey} />
                    </div>
                )}
            </fieldset>
        </div>
    );
};

export default SaleShipmentForm;
