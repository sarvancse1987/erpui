// // utils/errorHandler.ts
// import type { RefObject } from "react";

// export const handleApiError = (error: any, toastRef?: RefObject<any>) => {
//   let message = "Something went wrong";

//   if (error?.response?.data?.error?.message) {
//     message = error.response.data.error.message;
//   } else if (error?.response?.data?.message) {
//     message = error.response.data.message;
//   } else if (error?.message) {
//     message = error.message;
//   }

//   if (toastRef?.current) {
//     toastRef.current.show({
//       severity: "error",
//       summary: "Error",
//       detail: message,
//       life: 4000,
//     });
//   }
// };

type ToastFn = (options: {
  severity: "success" | "info" | "warn" | "error";
  summary?: string;
  detail: string;
  life?: number;
}) => void;

let globalToastFn: ToastFn | null = null;

export const setGlobalToastHandler = (fn: ToastFn) => {
  globalToastFn = fn;
};

export const handleApiError = (error: any) => {
  let message = "Something went wrong";

  if (error?.response?.data?.error?.message) {
    message = error.response.data.error.message;
  } else if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  }

  if (error?.response?.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return;
  }

  if (globalToastFn) {
    globalToastFn({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 4000,
    });
  } else {
    console.warn("Toast function not registered. Error:", message);
  }
};
