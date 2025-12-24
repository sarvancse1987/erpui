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
        {
          label: "Users",
          icon: "pi pi-fw pi-users",
          items: [
            { label: "Users", icon: "pi pi-fw pi-user", to: "/users" },
            { label: "Roles", icon: "pi pi-fw pi-briefcase", to: "/users/roles" },
            { label: "User Types", icon: "pi pi-fw pi-id-card", to: "/users/usertypes" },
          ],
        },
        {
          label: "Companies",
          icon: "pi pi-fw pi-building",
          items: [
            { label: "Companies", icon: "pi pi-fw pi-sitemap", to: "/companies" },
            { label: "Locations", icon: "pi pi-fw pi-map-marker", to: "/companies/locations" },
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
      items: [
        {
          label: "Sales",
          icon: "pi pi-fw pi-wallet",
          to: "/sales",
        },
        {
          label: "Shipments",
          icon: "pi pi-fw pi-truck",
          to: "/sales/shipments",
        },
      ],
    },
    {
      label: "Inventory",
      icon: "pi pi-fw pi-box", // main menu icon
      to: "/inventory",
      items: [
        { label: "Inventory", icon: "pi pi-fw pi-box", to: "/inventory" }
      ],
    },
    {
      label: "Ledger",
      icon: "pi pi-fw pi-home",
      to: "/ledger",
      items: [
        { label: "Ledger", icon: "pi pi-fw pi-home", to: "/ledger" },
        { label: "Voucher", icon: "pi pi-fw pi-file-edit", to: "/ledger/voucher" }
      ],
    }
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
