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
                <TabPanel header="Sales Summary" leftIcon="pi pi-chart-line">
                    <Card className="erp-report-card">
                        <SalesSummary />
                    </Card>
                </TabPanel>

                <TabPanel header="Customer Ledger" leftIcon="pi pi-users">
                    <Card className="erp-report-card">
                        <CustomerLedger />
                    </Card>
                </TabPanel>

                <TabPanel header="Outstanding" leftIcon="pi pi-clock">
                    <Card className="erp-report-card">
                        <OutstandingReport />
                    </Card>
                </TabPanel>

                <TabPanel header="Stock Summary" leftIcon="pi pi-database">
                    <Card className="erp-report-card">
                        <StockSummary />
                    </Card>
                </TabPanel>

                <TabPanel header="Purchase Summary" leftIcon="pi pi-shopping-cart">
                    <Card className="erp-report-card">
                        <PurchaseSummary />
                    </Card>
                </TabPanel>

                <TabPanel header="GST Sales" leftIcon="pi pi-file-excel">
                    <Card className="erp-report-card">
                        <GstSalesReport />
                    </Card>
                </TabPanel>
            </TabView>
        </div>
    );
};
