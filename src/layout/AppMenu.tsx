import React, { useContext } from "react";
import AppMenuitem from "./AppMenuitem";
import { LayoutContext } from "./context/layoutcontext";
import { MenuProvider } from "./context/menucontext";
import { AppMenuItem } from "./layoutprops";

const AppMenu: React.FC = () => {
  const { layoutConfig } = useContext(LayoutContext);

  const model: AppMenuItem[] = [
    {
      label: "Home",
      items: [{ label: "Dashboard", icon: "pi pi-fw pi-home", to: "/" }],
    },
    {
      label: "Master",
      items: [
        {
          label: "Products",
          icon: "pi pi-fw pi-box",
          items: [
            { label: "Categories", icon: "pi pi-fw pi-tags", to: "/products/category" },
            { label: "Groups", icon: "pi pi-fw pi-list", to: "/products/group" },
            { label: "Brands", icon: "pi pi-fw pi-briefcase", to: "/products/brand" },
            { label: "Products", icon: "pi pi-fw pi-box", to: "/products" },
            { label: "Units", icon: "pi pi-fw pi-cog", to: "/products/unit" },
          ],
        },
      ],
    },
    {
      label: "Customers",
      icon: "pi pi-fw pi-user",
      to: "/customers",
      items: [{ label: "Customers", icon: "pi pi-fw pi-user", to: "/customers" }],
    },
    {
      label: "Suppliers",
      icon: "pi pi-fw pi-building",
      to: "/suppliers",
      items: [{ label: "Suppliers", icon: "pi pi-fw pi-building", to: "/suppliers" }],
    },
    {
      label: "Purchase",
      icon: "pi pi-fw pi-shopping-cart",
      to: "/purchase",
      items: [{ label: "Purchase", icon: "pi pi-fw pi-shopping-cart", to: "/purchase" }],
    },
    {
      label: "Sales",
      icon: "pi pi-fw pi-wallet",
      to: "/sales",
      items: [{ label: "Sales", icon: "pi pi-fw pi-wallet", to: "/sales" }],
    },
  ];

  return (
    <MenuProvider>
      <ul className="layout-menu">
        {model.map((item, i) =>
          !item.seperator ? (
            <AppMenuitem item={item} root={true} index={i} key={item.label} />
          ) : (
            <li className="menu-separator" key={`separator-${i}`}></li>
          )
        )}
      </ul>
    </MenuProvider>
  );
};

export default AppMenu;
