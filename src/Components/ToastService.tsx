import { useContext } from "react";
import { ToastContext } from "./ToastContext";

export const useToast = () => {
  const toast = useContext(ToastContext);

  const showSuccess = (message: string) => {
    toast?.current?.show({
      severity: "success",
      summary: "Success",
      detail: message,
      life: 3000,
    });
  };

  const showError = (
    message: string = "Something went wrong. Please try again."
  ) => {
    toast?.current?.show({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 3000,
    });
  };

  return { showSuccess, showError };
};
