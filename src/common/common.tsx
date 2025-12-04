import { useState } from "react";
import apiService from "../services/apiService";
import { decryptData } from "../services/crypto-js";
import { UserAccessVm } from "../models/CommonVm";

export const validateForm = (fields: any) => {
  const errors: Record<string, string> = {};

  Object.keys(fields).forEach((key) => {
    const value = fields[key];
    const element = document.getElementById(key);
    const input = element?.querySelector("input");
    const validate =
      element?.getAttribute("data-validate") ??
      input?.getAttribute("data-validate");

    if (validate !== null && validate === "true") {
      switch (true) {
        // MultiSelect
        case element?.classList.contains("p-multiselect"):
          if (!Array.isArray(value) || value.length === 0) {
            errors[key] = "This field is required";
          }
          break;

        // RadioButton group
        case !!element?.querySelector?.('input[type="radio"]'):
          if (value === null || value === undefined || value === "") {
            errors[key] = "This field is required";
          }
          break;

        // Checkbox group
        case !!element?.querySelector?.('input[type="checkbox"]'):
          if (!Array.isArray(value) || value.length === 0) {
            errors[key] = "This field is required";
          }
          break;

        // InputText
        case element instanceof HTMLInputElement:
          if (!value || String(value).trim() === "") {
            errors[key] = "This field is required";
          }
          break;

        case element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement:
          if (!value?.toString().trim()) {
            errors[key] = "This field is required";
          }
          break;

        // InputNumber
        case element?.classList.contains("p-inputnumber"):
          if (
            value === null ||
            value === undefined ||
            isNaN(value) ||
            value === ""
          ) {
            errors[key] = "This field is required";
          }
          break;

        case element?.classList.contains("p-calendar"):
        case element?.querySelector(".p-calendar") !== null:
          if (!value) {
            errors[key] = "This field is required";
          }
          break;

        // Generic fallback for Dropdown (single value)
        case element instanceof HTMLDivElement:
          if (!value) {
            errors[key] = "This field is required";
          }
          break;
        case !!element?.querySelector("input"):
        case !!element?.querySelector("textarea"):
          if (!value || String(value).trim() === "") {
            errors[key] = "This field is required";
          }
          break;

        default:
          break;
      }
    }
  });

  return errors;
};

export const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setState: React.Dispatch<React.SetStateAction<any>>
) => {
  const { id, value } = e.target;
  setState((prevState: any) => ({
    ...prevState,
    [id]: value,
  }));
};

export const useForm = <T extends Record<string, any>>(initialState: T) => {
  const [formState, setFormState] = useState<T>(initialState);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return { formState, handleChange, setFormState };
};

export const allowPercentage = (value: string): string => {
  if (!value) return "";

  let filtered = value.replace(/[^0-9%]/g, "");

  const parts = filtered.split("%");
  filtered = parts[0];
  const hasPercent = parts.length > 1;

  let num = parseInt(filtered, 10);
  if (isNaN(num)) num = 0;

  if (num > 100) {
    num = 100;
    return num + "%";
  }

  return hasPercent ? num + "%" : filtered;
};

export const allowValidCompanyName = (
  value: string,
  maxLength: number
): string => {
  const filteredValue = value.replace(/[^a-zA-Z0-9@._\- '"&()]/g, "");
  return filteredValue.slice(0, maxLength);
};

export const allowValidAddress = (value: string, maxLength: number): string => {
  const allowedRegex = /^[a-zA-Z0-9 ,.\-/()&]$/;
  let result = "";

  for (const char of value) {
    if (allowedRegex.test(char)) {
      result += char;
    }
    if (result.length >= maxLength) break;
  }

  return result;
};

export const allowLoanLimit = (value: string): string => {
  let filtered = value.replace(/[^0-9]/g, "");
  if (filtered.length > 2) {
    filtered = filtered.slice(0, 2);
  }

  let num = parseInt(filtered, 10);

  if (isNaN(num)) {
    return "";
  }
  if (num > 10) {
    num = 10;
  }

  return num.toString();
};

export const allowNoticePeriod = (value: string): string => {
  const filtered = value.replace(/[^0-9]/g, "");

  let num = parseInt(filtered, 10);

  if (isNaN(num)) {
    return "";
  }
  if (num > 100) {
    num = 100;
  }

  return num.toString();
};

export const allowValidString = (
  value: string,
  maxLength: number,
  allowSpaces: boolean = true
): string => {
  const regex = allowSpaces ? /[^a-zA-Z ]/g : /[^a-zA-Z]/g;
  const filtered = value.replace(regex, "");
  return filtered.slice(0, maxLength);
};

export const allowValidText = (value: string, maxLength: number): string => {
  const filteredValue = value.replace(/[^a-zA-Z ]/g, "");
  return filteredValue.slice(0, maxLength);
};

export const allowValidNumber = (value: string, maxLength: number): string => {
  const filteredValue = value.replace(/[^0-9]/g, "");
  return filteredValue.slice(0, maxLength);
};
export const allowValidNum = (value: string, max: number): number => {
  let num = parseInt(value.replace(/[^0-9]/g, ""), 10);

  if (isNaN(num)) num = 0;

  if (num > max) num = max;

  return num;
};

export const allowValidFloat = (
  value: string,
  maxIntegerLength: number,
  maxDecimals = 2
): string => {
  if (!value) return value;

  let filtered = value.replace(/[^0-9.]/g, "");

  const firstDot = filtered.indexOf(".");
  if (firstDot !== -1) {
    filtered =
      filtered.slice(0, firstDot + 1) +
      filtered.slice(firstDot + 1).replace(/\./g, "");
  }

  const parts = filtered.split(".");
  let intPart = parts[0] || "";
  const decPart = parts[1] || "";

  intPart = intPart.slice(0, maxIntegerLength);

  if (intPart === "" && filtered.startsWith(".")) {
    intPart = "0";
  }

  if (firstDot === -1) {
    return intPart;
  }

  const decimals = decPart.slice(0, maxDecimals);
  return decimals.length > 0 ? `${intPart}.${decimals}` : `${intPart}.`;
};
export const allowValidCompanyContactNumber = (
  value: string,
  maxLength: number
): string => {
  const allowedSpecials = new Set<string>();
  const specialChars = "+()- ";
  let result = "";

  for (const char of value) {
    if (/[0-9]/.test(char)) {
      result += char;
    } else if (specialChars.includes(char)) {
      if (!allowedSpecials.has(char)) {
        allowedSpecials.add(char);
        result += char;
      }
    }

    if (result.length >= maxLength) {
      break;
    }
  }

  return result;
};

export const allowValidEmail = (value: string, maxLength: number): string => {
  const filteredValue = value.replace(/[^a-zA-Z0-9@._-]/g, "");
  return filteredValue.slice(0, maxLength);
};

export const isValidEmailFormat = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const allowValidWebsiteFormat = (
  value: string,
  maxLength: number
): string => {
  const specialChars = [":", "/", ".", "-", "_", "?", "#", "=", "&"];
  let result = "";

  for (const char of value) {
    if (/[a-zA-Z0-9]/.test(char) || specialChars.includes(char)) {
      result += char;
    }

    if (result.length >= maxLength) {
      break;
    }
  }

  return result;
};

export const allowValidGSTNumber = (
  value: string,
  maxLength: number
): string => {
  const upperValue = value.toUpperCase();
  const filteredValue = upperValue.replace(/[^A-Z0-9]/g, "");
  return filteredValue.slice(0, maxLength);
};

type AllowRule =
  | "alpha"
  | "numeric"
  | "space"
  | "hyphen"
  | "slash"
  | "dot"
  | "underscore"
  | "at"
  | "amp"
  | "bracket"
  | "quote";

export const allowCustomValidValue = (
  value: string,
  allow: AllowRule[],
  maxLength: number = 50,
  toUpper: boolean = false
): string => {
  let pattern = "";

  if (allow.includes("alpha")) pattern += "A-Za-z";
  if (allow.includes("numeric")) pattern += "0-9";
  if (allow.includes("space")) pattern += " ";
  if (allow.includes("hyphen")) pattern += "\\-";
  if (allow.includes("slash")) pattern += "\\/";
  if (allow.includes("amp")) pattern += "&";
  if (allow.includes("bracket")) pattern += "\\(\\)";

  const regex = new RegExp(`[^${pattern}]`, "g");

  const filteredValue = value.replace(regex, "");
  const result = filteredValue.slice(0, maxLength);

  return toUpper ? result.toUpperCase() : result;
};

export const allowValidIFSC = (
  value: string,
  maxLength: number = 11
): string => {
  const filteredValue = value.replace(/[^A-Za-z0-9]/g, "");

  return filteredValue.slice(0, maxLength).toUpperCase();
};

export const allowValidEPF = (
  value: string,
  maxLength: number = 22
): string => {
  const filteredValue = value.replace(/[^A-Za-z0-9/]/g, "");

  return filteredValue.slice(0, maxLength).toUpperCase();
};

export const allowValidESI = (
  value: string,
  maxLength: number = 17
): string => {
  const filteredValue = value.replace(/[^0-9-]/g, "");
  return filteredValue.slice(0, maxLength);
};

export const allowValidPT = (value: string, maxLength: number = 25): string => {
  const filteredValue = value.replace(/[^A-Za-z0-9/]/g, "");

  return filteredValue.slice(0, maxLength).toUpperCase();
};

export const validatePassword = (password: string) => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 5) {
    return "Password must be at least 5 characters long";
  }
  return "";
};

export const bindDropDown = async (
  MasterInfoId: number | null,
  ModuleName: string
): Promise<any[] | undefined> => {
  const response = await apiService.post("/Common/GetDropdown", {
    MasterInfoId,
    ModuleName,
  });

  const data = JSON.parse(response.result);
  if (
    data.length === 1 &&
    Object.values(data[0]).every((val) => val === null)
  ) {
    return [];
  }

  const mapped = data[0].map((item: any) => {
    const entries = Object.entries(item);
    return {
      value: entries[0][1],
      label: entries[1][1],
    };
  });
  return mapped;
};

export const bindDropDownStatus = async (
  IsMine: boolean,
  ModuleName: string,
  ModuleId: number | null
): Promise<any[] | undefined> => {
  const response = await apiService.post("/Common/GetDropdownStatus", {
    IsMine,
    ModuleName,
    ModuleId,
  });

  const data = JSON.parse(response.result);
  if (
    data.length === 1 &&
    Object.values(data[0]).every((val) => val === null)
  ) {
    return [];
  }

  const mapped = data[0].map((item: any) => {
    const entries = Object.entries(item);
    return {
      value: entries[0][1],
      label: entries[1][1],
    };
  });
  return mapped;
};

export const parseDateFromDDMMYYYY = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  const [day, month, year] = dateStr.split("-");
  const date = new Date(`${year}-${month}-${day}T00:00:00`);

  return isNaN(date.getTime()) ? null : date;
};

export const handleNullEmptyValues = (val: any) => {
  return val === null || val === undefined || val === "" ? 0 : val;
};

export const convertTimeStringToDate = (timeStr: string): Date | null => {
  if (!timeStr) return null;
  const date = new Date(`1970-01-01T${convertTo24Hour(timeStr)}`);
  return isNaN(date.getTime()) ? null : date;
};
const convertTo24Hour = (timeStr: string): string => {
  const [time, modifier] = timeStr.split(" ");
  const [hoursStr, minutesStr] = time.split(":");
  let hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:00`;
};

export const parseTimeStringEdit = (timeStr: string): Date => {
  const [time, modifier] = timeStr.split(" ");
  const [rawHours, rawMinutes] = time.split(":");
  let hours = parseInt(rawHours, 10);
  const minutes = parseInt(rawMinutes, 10);

  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return new Date(now);
};

export const parseDateEditDMY = (dmy: string): Date => {
  const [day, month, year] = dmy.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getUserAccess = (Module: string) => {
  const encryptedLocal = getCookie("userAccessData");

  if (encryptedLocal) {
    const decryptedData = decryptData(encryptedLocal);
    const data = JSON.parse(decryptedData.result);
    const userdata = data[0][0];
    const userAccess = data[1];

    const moduleAccess = userAccess.filter(
      (item: any) => item.Module === Module && item.IsHasAccess === 1
    );

    return { moduleAccess, userdata };
  }

  return { moduleAccess: [], userdata: null };
};
export const getModuleAccessMap = (Module: string) => {
  const { moduleAccess: rawAccess, userdata } = getUserAccess(Module);

  const userGroupId: number | null =
    rawAccess.length > 0 && rawAccess[0].UserGroupId != null
      ? rawAccess[0].UserGroupId
      : null;

  const accessMap = {
    View: false,
    Create: false,
    Update: false,
    Delete: false,
    UserGroupId: userGroupId,
    IsMine: userdata?.ReportingPerson == "Yes" ? true : false,
  };

  rawAccess.forEach((a: any) => {
    const action = a.ModuleAction as keyof Omit<UserAccessVm, "UserGroupId">;
    if (a.IsHasAccess === 1 && action in accessMap) {
      accessMap[action] = true;
    }
  });

  return accessMap;
};

export const getColorFromName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 50%)`;
  return color;
};

export const getInitialsAndColor = (fullName: string = "") => {
  const cleanName = fullName.trim();
  if (!cleanName) {
    return { initials: "", bgColor: getColorFromName("") };
  }

  const noParens = cleanName.replace(/\(.*?\)/g, "").trim();
  const nameParts = noParens.split(/\s+/).filter(Boolean);

  const getFirstValidChar = (str: string) => {
    for (const char of str) {
      if (/[A-Za-z0-9]/.test(char)) return char.toUpperCase();
    }
    return "";
  };

  let initials = "";

  if (nameParts.length === 1) {
    let chars = "";
    for (const char of nameParts[0]) {
      if (/[A-Za-z0-9]/.test(char)) {
        chars += char.toUpperCase();
        if (chars.length === 2) break;
      }
    }
    initials = chars;
  } else {
    const firstInitial = getFirstValidChar(nameParts[0]);
    const lastInitial = getFirstValidChar(nameParts[nameParts.length - 1]);
    initials = firstInitial + lastInitial;
  }

  return { initials, bgColor: getColorFromName(fullName) };
};


export const parseDate = (value: string | Date | null): Date | null => {
  if (!value) return null;

  // If already a Date → return as-is
  if (value instanceof Date) return value;

  // Otherwise parse string "dd-MM-yyyy"
  const parts = value.split("-");
  const day = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const year = Number(parts[2]);
  return new Date(year, month, day);
};

// export const setCookie = (name: string, value: string, days?: number) => {
//   let expires = "";
//   if (days) {
//     const date = new Date();
//     date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
//     expires = `; expires=${date.toUTCString()}`;
//   }

//   const isSecure = window.location.protocol === "https:" ? "; secure" : "";

//   document.cookie = `${name}=${
//     value || ""
//   }; path=/${expires}${isSecure}; samesite=lax`;
// };

// export const getCookie = (name: string): string | null => {
//   const match = document.cookie
//     .split("; ")
//     .find((row) => row.startsWith(name + "="));
//   return match ? decodeURIComponent(match.split("=")[1]) : null;
// };

// export const removeCookie = (name: string) => {
//   const isSecure = window.location.protocol === "https:" ? "; secure" : "";

//   document.cookie = `${name}=; path=/; expires=${new Date(
//     0
//   ).toUTCString()}${isSecure}; samesite=lax`;
// };

export function setCookie(name: string, value: string, days?: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  const isSecure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${value || ""}; path=/${expires}${isSecure}; samesite=lax`;
}

export function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function removeCookie(name: string) {
  const isSecure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=; path=/; expires=${new Date(0).toUTCString()}${isSecure}; samesite=lax`;
}


export const handleEnterKey = (e: any) => {
  if (e.key === "Enter") {
    e.preventDefault();

    const currentTab = Number(e.target.getAttribute("tabindex"));
    const nextControl: any = document.querySelector(`[tabindex="${currentTab + 1}"]`);

    if (nextControl) nextControl.focus();
  }
};

export const handleNumberInputWithEnter = (e: any) => {

  // --- Allow Enter (for navigation) ---
  if (e.key === "Enter") {
    e.preventDefault();
    const currentTab = Number(e.target.getAttribute("tabindex"));
    const nextControl: any = document.querySelector(
      `[tabindex="${currentTab + 1}"]`
    );
    if (nextControl) nextControl.focus();
    return;
  }

  // --- Allow only numbers ---
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
  
  if (/^[0-9]$/.test(e.key)) return;    // allow numeric digits
  if (allowedKeys.includes(e.key)) return; // allow navigation keys

  // Block all other keys
  e.preventDefault();
};