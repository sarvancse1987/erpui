// src/layout/Header.tsx
import { Menubar } from "primereact/menubar";
import { useNavigate } from "react-router-dom";
import "../../asset/basiclayout/Header.css";

export const Header = () => {
  const navigate = useNavigate();

  // Center menu items
  const centerItems = [
    { label: "Home", icon: "pi pi-home", command: () => navigate("/home") },
    { label: "About Us", icon: "pi pi-info-circle", command: () => navigate("/about") },
    { label: "Products", icon: "pi pi-box", command: () => navigate("/product") },
    { label: "Services", icon: "pi pi-cog", command: () => navigate("/services") },
    { label: "Contact", icon: "pi pi-phone", command: () => navigate("/contact") }
  ];

  // Right aligned items
  const endItems = (
    <div className="flex gap-2">
      <button
        className="p-button p-button-text p-button-sm"
        onClick={() => navigate("/login")}
      >
        <i className="pi pi-sign-in mr-2"></i>
        Login
      </button>

      <button
        className="p-button p-button-outlined p-button-sm"
        onClick={() => navigate("/signup")}
      >
        <i className="pi pi-user-plus mr-2"></i>
        Signup
      </button>
    </div>
  );

  return (
    <div className="app-header shadow-2">
      <Menubar
        model={centerItems}
        className="custom-menubar"
        end={endItems}
      />
    </div>
  );
};
