import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ShipmentModel } from "../../models/shipment/ShipmentModel";
import { InputTextarea } from "primereact/inputtextarea";
import { parseDate } from "../../common/common";
import apiService from "../../services/apiService";
import { ShipmentTypeModel } from "../../models/shipment/ShipmentTypeModel";
import { InputNumber } from "primereact/inputnumber";

export interface SalesShipmentFormProps {
    isEditSidebar: boolean;
    onSave?: (data: ShipmentModel) => void;
    onCancel?: () => void;
    shipmentInfo?: ShipmentModel | null;
}

const SaleShipmentForm: React.FC<SalesShipmentFormProps> = ({
    isEditSidebar = false,
    onSave,
    onCancel,
    shipmentInfo
}) => {

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
    const [shipmentTypes, setShipmentTypes] = useState<ShipmentTypeModel[]>([]);
    const [validationErrors, setValidationErrors] = useState<any>({});

    const loadAllData = async () => {
        try {
            const shipmentType = await apiService.get("/ShipmentType");
            const shipmentTypeOptions = (shipmentType?.data ?? []).map((pt: ShipmentTypeModel) => ({
                label: pt.shipmentTypeName,
                value: pt.shipmentTypeId,
                text: pt.shipmentTypeValue
            }));
            setShipmentTypes(shipmentTypeOptions ?? []);


            const defaultType = shipmentTypeOptions.find((x: any) => x.text === "OWN");

            if (defaultType) {
                setFormData(prev => ({
                    ...prev,
                    shipmentTypeId: defaultType.value,
                    shipmentTypeValue: defaultType.text
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleChange = (field: keyof ShipmentModel, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveForm = () => {
        let v: any = {};

        if (!formData.shipmentDate) v.shipmentDate = "Choose shipment date";
        if (!formData.shipmentTypeId) v.shipmentTypeId = "Choose shipment type";
        if (!formData.address) v.address = "Enter address";

        setValidationErrors(v);

        if (Object.keys(v).length === 0) {
            onSave?.(formData);
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
            shipmentDate: isEditSidebar ? parseDate(shipmentInfo?.shipmentDate) : parseDate(new Date()),
        }));

    }, [shipmentInfo]);

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
                            value={formData.shipmentDate ? new Date(formData.shipmentDate) : null}
                            onChange={(e) => handleChange("shipmentDate", e.value ?? null)}
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
                            onChange={(e) => handleChange("shipmentTypeId", e.value)}
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
                            onChange={(e) => handleChange("vehicleNo", e.target.value)}
                            className="w-full mt-1 text-sm" placeholder="Vechicle no"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 p-1">

                    {/* Address */}
                    <div className="flex-1 min-w-[250px]">
                        <strong className="text-sm">
                            Address <span className="mandatory-asterisk">*</span>
                        </strong>
                        <InputTextarea autoResize value={formData.address} onChange={(e) => handleChange("address", e.target.value)} rows={5} cols={30}
                            className={`w-full mt-1 text-sm ${validationErrors.address ? "p-invalid" : ""}`}
                            placeholder="Address" />

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
                        />
                    </div>

                    <div className="min-w-[150px] flex-1">
                        <strong className="text-sm">Distance</strong>
                        <InputNumber
                            value={formData.distance}
                            onChange={(e) => handleChange("distance", e.value)}
                            className="w-full mt-1 text-sm"
                            placeholder="Distance"
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
                            className="p-button-sm custom-xs" onClick={handleSaveForm} />
                    </div>
                )}
            </fieldset>
        </div>
    );
};

export default SaleShipmentForm;
