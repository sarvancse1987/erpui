import { ConfirmDialog } from "primereact/confirmdialog";
import { useState } from "react";

export default function TConfirmDialog() {
  const [visible, setVisible] = useState(false);
  const accept = () => {
  
  };

  const reject = () => {
   
  };
  return (
    <>
      <ConfirmDialog
        group="declarative"
        visible={visible}
        onHide={() => setVisible(false)}
        message="Are you sure you want to proceed?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={accept}
        reject={reject}
        style={{ width: "50vw" }}
        breakpoints={{ "1100px": "75vw", "960px": "100vw" }}
      />
    </>
  );
}
