import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { storage } from "../../services/storageService";

export function useVoiceCommands() {
  const navigate = useNavigate();

  const commands = useMemo(() => {
    const list: { command: string[]; callback: () => void }[] = [];

    // ================= DASHBOARD =================
    if (storage.hasModule("Dashboard")) {
      list.push({
        command: ["open dashboard", "go home", "home"],
        callback: () => navigate("/"),
      });
    }

    // ================= SALES =================
    if (storage.hasModule("Sales")) {
      list.push({
        command: ["open sales", "go to sales", "open sale", "add sale"],
        callback: () => navigate("/sales?add"),
      });

      if (storage.hasModule("Quotations")) {
        list.push({
          command: ["open quotation", "open quotations", "add quotation"],
          callback: () => navigate("/sales/quotations"),
        });
      }

      if (storage.hasModule("Shipments")) {
        list.push({
          command: ["open shipments", "add shipment"],
          callback: () => navigate("/sales/shipments"),
        });
      }
    }

    // ================= INVENTORY =================
    if (storage.hasModule("Inventory")) {
      list.push({
        command: ["open inventory", "go to inventory", "add inventory"],
        callback: () => navigate("/inventory"),
      });
    }

    // ================= LEDGER =================
    if (storage.hasModule("Ledger")) {
      list.push({
        command: ["open ledger", "go to ledger", "add ledger"],
        callback: () => navigate("/ledger"),
      });

      if (storage.hasModule("Voucher")) {
        list.push({
          command: ["open voucher", "go to voucher", "add voucher"],
          callback: () => navigate("/ledger/voucher"),
        });
      }

      if (storage.hasModule("DailyExpense")) {
        list.push({
          command: ["open daily expense", "open expense", "add expense"],
          callback: () => navigate("/ledger/dailyexpense"),
        });
      }

      if (storage.hasModule("DailyBook")) {
        list.push({
          command: ["open daily book", "add daily book"],
          callback: () => navigate("/ledger/dailybook"),
        });
      }
    }

    // ================= USERS =================
    if (storage.hasModule("Users")) {
      list.push({
        command: ["open users", "go to users", "add user"],
        callback: () => navigate("/users"),
      });

      if (storage.hasModule("Roles")) {
        list.push({
          command: ["open roles", "go to roles", "add role"],
          callback: () => navigate("/users/roles"),
        });
      }

      if (storage.hasModule("User Types")) {
        list.push({
          command: ["open usertypes", "go to usertype", "go to usertypes", "add usertype"],
          callback: () => navigate("/users/usertypes"),
        });
      }

      if (storage.hasModule("Role Mapping")) {
        list.push({
          command: ["open role mapping", "add role mapping"],
          callback: () => navigate("/users/rolemapping"),
        });
      }
    }

    // ================= COMPANIES =================
    if (storage.hasModule("Companies")) {
      list.push({
        command: ["open companies", "go to companies", "add company"],
        callback: () => navigate("/companies"),
      });

      if (storage.hasModule("Locations")) {
        list.push({
          command: ["open locations", "add location"],
          callback: () => navigate("/companies/locations"),
        });
      }
    }

    // ================= CUSTOMERS =================
    if (storage.hasModule("Customers")) {
      list.push({
        command: ["open customers", "go to customers", "go to customer", "add customer"],
        callback: () => navigate("/customers"),
      });
    }

    // ================= SUPPLIERS =================
    if (storage.hasModule("Suppliers")) {
      list.push({
        command: ["open suppliers", "go to supplier", "add suppliers", "add supplier"],
        callback: () => navigate("/suppliers"),
      });
    }

    // ================= PURCHASE =================
    if (storage.hasModule("Purchase")) {
      list.push({
        command: ["open purchase", "go to purchase", "add purchase"],
        callback: () => navigate("/purchase"),
      });
    }

    return list;
  }, [navigate]);

  return commands;
}
