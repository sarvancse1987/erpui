import { Toast } from "primereact/toast";
import type  { RefObject } from "react";

export function isStringNullOrEmpty(value: any) {
    return (value == undefined || value == null || value.length === 0);
}

export function isArrayNullOrEmpty(value: any) {
    return (value == undefined || value == null || value.length === 0);
}

let toastRef: RefObject<Toast> | undefined;

export const setGlobalToastRef = (ref: RefObject<Toast>) => {
  toastRef = ref;
};

export const getGlobalToastRef = (): RefObject<Toast> | undefined => toastRef;
