import React from "react";
import AppMenuitem from "./AppMenuitem";
import { MenuProvider } from "./context/menucontext";
import { AppMenuItem } from "./layoutprops";
import { storage } from "../services/storageService";

const AppMenu: React.FC = () => {
  const model: AppMenuItem[] = [];

  // ================= DASHBOARD =================
  if (storage.hasModule("Dashboard")) {
    model.push({
      label: "Home",
      items: [
        {
          label: "Dashboard",
          icon: "pi pi-fw pi-home",
          to: "/",
        },
      ],
    });
  }

  // ================= MASTER =================
  const masterItems: AppMenuItem[] = [];

  // ---------- PRODUCTS ----------
  if (storage.hasModule("Products")) {
    const productItems: AppMenuItem[] = [];

    if (storage.hasModule("Product Category")) {
      productItems.push({
        label: "Categories",
        icon: "pi pi-fw pi-tags",
        to: "/products/category",
      });
    }

    if (storage.hasModule("Product Group")) {
      productItems.push({
        label: "Groups",
        icon: "pi pi-fw pi-list",
        to: "/products/group",
      });
    }

    if (storage.hasModule("Product Brand")) {
      productItems.push({
        label: "Brands",
        icon: "pi pi-fw pi-briefcase",
        to: "/products/brand",
      });
    }

    if (storage.hasModule("Products")) {
      productItems.push({
        label: "Products",
        icon: "pi pi-fw pi-box",
        to: "/products",
      });
    }

    if (storage.hasModule("Product Unit")) {
      productItems.push({
        label: "Units",
        icon: "pi pi-fw pi-cog",
        to: "/products/unit",
      });
    }

    if (productItems.length > 0) {
      masterItems.push({
        label: "Products",
        icon: "pi pi-fw pi-box",
        items: productItems,
      });
    }
  }

  // ---------- USERS ----------
  if (storage.hasModule("Users")) {
    const userItems: AppMenuItem[] = [];

    if (storage.hasModule("Users")) {
      userItems.push({
        label: "Users",
        icon: "pi pi-fw pi-user",
        to: "/users",
      });
    }

    if (storage.hasModule("Roles")) {
      userItems.push({
        label: "Roles",
        icon: "pi pi-fw pi-briefcase",
        to: "/users/roles",
      });
    }

    if (storage.hasModule("User Types")) {
      userItems.push({
        label: "User Types",
        icon: "pi pi-fw pi-id-card",
        to: "/users/usertypes",
      });
    }

    if (storage.hasModule("Role Mapping")) {
      userItems.push({
        label: "Role Mapping",
        icon: "pi pi-fw pi-lock",
        to: "/users/rolemapping",
      });
    }

    if (userItems.length > 0) {
      masterItems.push({
        label: "Users",
        icon: "pi pi-fw pi-users",
        items: userItems,
      });
    }
  }

  // ---------- COMPANIES ----------
  if (storage.hasModule("Companies")) {
    const companyItems: AppMenuItem[] = [];

    companyItems.push({
      label: "Companies",
      icon: "pi pi-fw pi-sitemap",
      to: "/companies",
    });

    if (storage.hasModule("Locations")) {
      companyItems.push({
        label: "Locations",
        icon: "pi pi-fw pi-map-marker",
        to: "/companies/locations",
      });
    }

    masterItems.push({
      label: "Companies",
      icon: "pi pi-fw pi-building",
      items: companyItems,
    });
  }

  if (masterItems.length > 0) {
    model.push({
      label: "Master",
      items: masterItems,
    });
  }

  // ================= CUSTOMERS =================
  if (storage.hasModule("Customers")) {
    model.push({
      label: "Customers",
      icon: "pi pi-fw pi-user",
      to: "/customers",
      items: [
        {
          label: "Customers",
          icon: "pi pi-fw pi-user",
          to: "/customers",
        },
      ],
    });
  }

  // ================= SUPPLIERS =================
  if (storage.hasModule("Suppliers")) {
    model.push({
      label: "Suppliers",
      icon: "pi pi-fw pi-building",
      to: "/suppliers",
      items: [
        {
          label: "Suppliers",
          icon: "pi pi-fw pi-building",
          to: "/suppliers",
        },
      ],
    });
  }

  // ================= PURCHASE =================
  if (storage.hasModule("Purchase")) {
    model.push({
      label: "Purchase",
      icon: "pi pi-fw pi-shopping-cart",
      to: "/purchase",
      items: [
        {
          label: "Purchase",
          icon: "pi pi-fw pi-shopping-cart",
          to: "/purchase",
        },
      ],
    });
  }

  // ================= SALES =================
  if (storage.hasModule("Sales")) {
    const salesItems: AppMenuItem[] = [
      {
        label: "Sales",
        icon: "pi pi-fw pi-wallet",
        to: "/sales",
      },
    ];

    if (storage.hasModule("Quotations")) {
      salesItems.push({
        label: "Quotations",
        icon: "pi pi-file-edit",
        to: "/sales/quotations",
      });
    }

    if (storage.hasModule("Shipments")) {
      salesItems.push({
        label: "Shipments",
        icon: "pi pi-fw pi-truck",
        to: "/sales/shipments",
      });
    }

    model.push({
      label: "Sales",
      icon: "pi pi-fw pi-wallet",
      items: salesItems,
    });
  }

  // ================= INVENTORY =================
  if (storage.hasModule("Inventory")) {
    model.push({
      label: "Inventory",
      icon: "pi pi-fw pi-box",
      to: "/inventory",
      items: [
        {
          label: "Inventory",
          icon: "pi pi-fw pi-box",
          to: "/inventory",
        },
      ],
    });
  }

  // ================= LEDGER =================
  if (storage.hasModule("Ledger")) {
    const ledgerItems: AppMenuItem[] = [
      {
        label: "Customer Ledger",
        icon: "pi pi-fw pi-home",
        to: "/ledger",
      },
    ];

    if (storage.hasModule("Voucher")) {
      ledgerItems.push({
        label: "Customer Voucher",
        icon: "pi pi-fw pi-file-edit",
        to: "/ledger/voucher",
      });
    }

    if (storage.hasModule("DailyExpense")) {
      ledgerItems.push({
        label: "Daily Expense",
        icon: "pi pi-fw pi-shopping-cart",
        to: "/ledger/dailyexpense",
      });
    }

    if (storage.hasModule("DailyBook")) {
      ledgerItems.push({
        label: "Daily Book",
        icon: "pi pi-fw pi-book",
        to: "/ledger/dailybook",
      });
    }

    model.push({
      label: "Ledger",
      icon: "pi pi-fw pi-home",
      items: ledgerItems,
    });
  }

  if (storage.hasModule("Reports")) {
    model.push({
      label: "Reports",
      icon: "pi pi-fw pi-chart-bar",
      items: [
        {
          label: "Summary",
          icon: "pi pi-fw pi-home",
          to: "/reports",
        },
        {
          label: "Sales Reports",
          icon: "pi pi-fw pi-chart-line",
          to: "/reports/sales",
        },
        {
          label: "Inventory Reports",
          icon: "pi pi-fw pi-database",
          to: "/reports/inventory",
        },
      ],
    });
  }

  return (
    <MenuProvider>
      <ul className="layout-menu">
        {model.map((item, index) => (
          <AppMenuitem key={item.label} item={item} root index={index} />
        ))}
      </ul>
    </MenuProvider>
  );
};

export default AppMenu;
