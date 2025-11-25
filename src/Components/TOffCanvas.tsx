import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";

interface TOffCanvasProps {
  visible: boolean;
  onClose: () => void;
  header: string;
  children?: React.ReactNode;
  width?: string;                 // default sidebar width
  responsive?: string[];          // ["100%", "80%", "60%", "40%"]
  onSave?: (data?: any) => void;
  saveLabel?: string;
  saveColor?: string;
  loading?: boolean;
}

export default function TOffCanvas({
  visible,
  onClose,
  header,
  children,
  width = "40rem",
  responsive,
  onSave,
  saveLabel = "Save",
  saveColor = "primary",
  loading,
}: TOffCanvasProps) {
  const getWidth = () => {
    if (!responsive) return width;

    const w = window.innerWidth;
    if (w < 576) return responsive[0];
    if (w < 768) return responsive[1];
    if (w < 992) return responsive[2];
    return responsive[3];
  };

  return (
    <>
      <style>
        {`
         .p-sidebar-close {
        display: none !important;
      }
     .offCanvaClose {
        border-radius: 100px;
        border: 1.9px solid;
        width: 1.5rem;
        height: 1.5rem;
        color: #6b7280;
        background: transparent;
        transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
        padding: 0 !important;
        cursor: pointer;
      }
      .offCanvaClose .pi-times{
         font-size:12px;
      }
      `}
      </style>

      <Sidebar
        className="t-sidebar"
        visible={visible}
        position="right"
        onHide={onClose}
        showCloseIcon={false}
        style={{ width: getWidth() }}
      >
        {/* Header */}
        <div className="t-sidebar-header">
          {header}
          <div className="t-close-btn" onClick={onClose}>
            <i className="pi pi-times text-sm"></i>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">{children}</div>
      </Sidebar>
    </>
  );
}
