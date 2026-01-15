import { TabView, TabPanel } from "primereact/tabview";
import { Card } from "primereact/card";
import SalesSummary from "./SalesSummary";
import CustomerLedger from "./CustomerLedger";
import OutstandingReport from "./OutstandingReport";
import StockSummary from "./StockSummary";
import PurchaseSummary from "./PurchaseSummary";
import GstSalesReport from "./GstSalesReport";
import "../../asset/basiclayout/reports.css";

export const ReportSummary = () => {
    return (
        <div className="p-3">
            <TabView scrollable className="erp-tabs">
                <TabPanel header="Sales Summary" leftIcon="pi pi-chart-line mr-2">
                    <SalesSummary />
                </TabPanel>

                <TabPanel header="Customer Ledger" leftIcon="pi pi-users mr-2">
                    <CustomerLedger />
                </TabPanel>

                <TabPanel header="Outstanding" leftIcon="pi pi-clock mr-2">
                    <Card className="erp-report-card">
                        <OutstandingReport />
                    </Card>
                </TabPanel>

                <TabPanel header="Stock Summary" leftIcon="pi pi-database mr-2">
                    <Card className="erp-report-card">
                        <StockSummary />
                    </Card>
                </TabPanel>

                <TabPanel header="Purchase Summary" leftIcon="pi pi-shopping-cart mr-2">
                    <Card className="erp-report-card">
                        <PurchaseSummary />
                    </Card>
                </TabPanel>

                <TabPanel header="GST Sales" leftIcon="pi pi-file-excel mr-2">
                    <Card className="erp-report-card">
                        <GstSalesReport />
                    </Card>
                </TabPanel>
            </TabView>
        </div>
    );
};
