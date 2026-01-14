import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import apiService from "../../services/apiService";
import PurchaseFooterBox from "../purchase/PurchaseFooterBox";
import { formatINR } from "../../common/common";
import { ShipmentListModel } from "../../models/shipment/ShipmentListModel";
import { ColumnMeta } from "../../models/component/ColumnMeta";
import { TTypeDatatable } from "../../components/TTypeDatatable";
import { Sidebar } from "primereact/sidebar";
import SaleShipmentForm from "../shipment/ShipmentForm";
import { ShipmentModel } from "../../models/shipment/ShipmentModel";
import { useToast } from "../../components/ToastService";

export default function ShipmentList() {
    const [shipmentTypeId, setShipmentTypeId] = useState<number | null>(null);
    const [shipmentTypes, setShipmentTypes] = useState<any[]>([]);
    const [shipments, setShipments] = useState<ShipmentListModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [showShipment, setShowShipment] = useState(false);
    const [shipmentModel, setShipmentModel] = useState<ShipmentModel | null>(null);
    const [isEditShipmentList, setIsEditShipmentList] = useState<boolean>(false);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        loadShipments();
    }, []);

    useEffect(() => {
        loadShipments();
    }, [shipmentTypeId]);

    const loadShipments = async () => {
        setLoading(true);

        const res = await apiService.get("sale/shipments");
        setShipments(res.shipments);

        // Build shipment type dropdown
        const types = Array.from(
            res.shipments.reduce((map: Map<number, any>, x: any) => {
                if (!map.has(x.shipmentTypeId)) {
                    map.set(x.shipmentTypeId, {
                        value: x.shipmentTypeId,
                        label: x.shipmentTypeName
                    });
                }
                return map;
            }, new Map()).values()
        );

        setShipmentTypes(types);
        setLoading(false);
    };

    /* ---------- FOOTER TOTALS ---------- */
    const totalShipments = shipments.length;
    const totalDistance = shipments.reduce((s, x) => s + (x.distance ?? 0), 0);
    const totalValue = shipments.reduce((s, x) => s + (x.grandTotal ?? 0), 0);

    const footerTemplate = () => (
        <div className="flex justify-content-end gap-4 py-1 pr-3">
            <PurchaseFooterBox
                label="Shipments"
                value={totalShipments.toString()}
                bg="#0ea5e9"
            />
            <PurchaseFooterBox
                label="Total Distance"
                value={`${totalDistance.toFixed(2)} KM`}
                bg="#22c55e"
            />
            <PurchaseFooterBox
                label="Shipment Value"
                value={formatINR(totalValue)}
                bg="#1e40af"
            />
        </div>
    );

    /* ---------- COLUMN TEMPLATES ---------- */

    const columns: ColumnMeta<any>[] = [
        { field: "shipmentId", header: "ID", width: "80px", editable: false, hidden: true },
        { field: "shipmentDate", header: "Date", width: "150px" },
        { field: "shipmentTime", header: "Time", width: "150px" },
        { field: "shipmentTypeName", header: "Shipment Type", width: "150px" },
        { field: "vehicleNo", header: "Vehicle No", width: "140px" },
        { field: "driver", header: "Driver", width: "140px" },
        { field: "distance", header: "Distance", width: "140px" },
        {
            field: "grandTotal", header: "Amount", width: "140px", body: (row) =>
                <Tag
                    value={new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR"
                    }).format(row.grandTotal)}
                    className="amount-tag"
                    style={{
                        backgroundColor: "#3498db",
                        color: "white",
                        fontWeight: "500",
                        fontSize: "0.85rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        display: "inline-block",
                        textAlign: "center",
                        width: "90px"
                    }}
                />
        },
    ];

    const handleOpenEdit = (shipmentInfo: any) => {
        setShipmentModel(shipmentInfo);
        setShowShipment(true);
        setIsEditShipmentList(true);
    }

    const handleDelete = async (rows: ShipmentListModel[]) => {
        try {
            const ids = rows.map((r) => r.shipmentId);
            const response = await apiService.post("/Shipment/bulk-delete", ids);
            if (response && response.status) {
                showSuccess("Shipment(s) deleted successfully!");
                await loadShipments();
            } else {
                showError(response.error ?? "Shipment delete failed!");
            }
        } catch (err) {
            console.error(err);
            showError("Error deleting Shipment");
        }
    };

    const handleShipmentSuccess = (shipmentInfo: any) => {
        setShowShipment(false);
        setShipmentModel(shipmentInfo);
    }

    const onCancelShipmentSideBar = () => {
        setShowShipment(false);
        if (isEditShipmentList) {
            loadShipments();
        }
    };

    return (
        <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-2">🚚 Shipment Management</h2>

            <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
                <legend className="text-sm font-semibold px-2 text-gray-700">
                    Shipment Summary
                </legend>

                <div className="flex gap-2 mb-3">
                    <Dropdown
                        value={shipmentTypeId}
                        options={shipmentTypes}
                        placeholder="Select Shipment Type"
                        className="w-20rem"
                        onChange={(e) => setShipmentTypeId(e.value)}
                        showClear
                    />
                    <Button
                        icon="pi pi-refresh"
                        severity="secondary"
                        onClick={loadShipments}
                    />
                </div>

                <TTypeDatatable<ShipmentListModel>
                    data={shipments}
                    columns={columns}
                    primaryKey="shipmentId"
                    onEdit={handleOpenEdit}
                    isDelete={true}
                    onDelete={handleDelete}
                    isNew={false}
                    isEdit={true}
                    isSave={false}
                    page="shipment"
                    showDateFilter={true}
                    showDdlFilter={true}
                />

                <Sidebar
                    visible={showShipment}
                    position="right"
                    style={{ width: "850px" }}
                    onHide={() => setShowShipment(false)}
                    header="Add Shipment"
                >
                    <SaleShipmentForm
                        isEditSidebar={true}
                        onSave={handleShipmentSuccess}
                        onCancel={onCancelShipmentSideBar}
                        shipmentInfo={shipmentModel}
                        isEditShipmentList={isEditShipmentList}
                    />
                </Sidebar>

            </fieldset>
        </div>
    );
}
