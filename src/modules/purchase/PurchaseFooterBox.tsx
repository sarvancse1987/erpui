interface FooterBoxProps {
    label: string;
    value: string;
    bg?: string;
}

const PurchaseFooterBox: React.FC<FooterBoxProps> = ({
    label,
    value,
    bg = "#3498db"
}) => {
    return (
        <div
            className="flex items-center justify-start px-2 py-0.5 text-sm font-semibold"
            style={{
                background: bg,
                color: "white",
                borderRadius: 0,
                minWidth: 130,
                height: "27px"
            }}
        >
            <span style={{ alignSelf: "center" }}>
                {label}: {value}
            </span>
        </div>
    );
};

export default PurchaseFooterBox;
