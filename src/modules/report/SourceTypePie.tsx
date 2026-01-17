import { Card } from "primereact/card";
import { CustomerLedgerModel } from "../../models/CustomerLedgerModel";
import { Chart } from "primereact/chart";

const SourceTypePie = ({ ledger }: { ledger: CustomerLedgerModel[] }) => {
    const totalVoucher = ledger.filter(l => l.sourceType === "Voucher").length;
    const totalOther = ledger.length - totalVoucher;

    const data = {
        labels: ["Voucher", "Other"],
        datasets: [
            {
                data: [totalVoucher, totalOther],
                backgroundColor: ["#3B82F6", "#F59E0B"],
            },
        ],
    };

    const options = { maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } };

    return (
        <Card title="Source Type Distribution">
            <div style={{ height: "220px" }}>
                <Chart type="doughnut" data={data} options={options} />
            </div>
        </Card>
    );
};
export default SourceTypePie;