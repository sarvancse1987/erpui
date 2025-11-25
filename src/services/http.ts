import axios from "axios";
import type { AxiosInstance } from "axios";
import { handleApiError } from "./handleApiError";
import { getCookie } from "../common/common";
import { useContext } from "react";
import { ToastContext } from "../components/ToastContext";

let setLoadingGlobal: ((loading: boolean) => void) | null = null;
let activeRequests = 0;
const toastRef = (ToastContext as any)._currentValue;

export const setLoaderHandler = (fn: (loading: boolean) => void) => {
  setLoadingGlobal = fn;
};

const token = getCookie("authToken");
const httpClientCache: { url: string; instance: AxiosInstance }[] = [];

function updateLoading() {
  activeRequests = Math.max(activeRequests, 0);
  setLoadingGlobal?.(activeRequests > 0);
}

const createHttpClient = (baseURL: string, includeAuth = true): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 80000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    if (includeAuth && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const companyId = localStorage.getItem("companyId") || "1"; // or from context/state
    const locationId = localStorage.getItem("locationId") || "1";
    config.headers["CompanyId"] = Number(companyId);
    config.headers["LocationId"] = Number(locationId);

    activeRequests++;
    updateLoading();

    return config;
  });

  client.interceptors.response.use(
    (response) => {
      activeRequests--;
      updateLoading();

      const resData = response.data;
      if ("status" in resData && "message" in resData) {
        if (resData.status === false) {
          toastRef?.current?.show({
            severity: "error",
            summary: "Error",
            detail: resData.message,
            life: 3000,
          });

          return Promise.resolve({
            status: false,
            error: resData.message
          });
        }
        return resData;
      }

      return resData;
    },
    (error) => {
      activeRequests--;
      updateLoading();
      handleApiError(error);
      return Promise.reject(error);
    }
  );

  return client;
};

export const getHttpClient = (baseUrl?: string, includeAuth = true) => {
  const finalBaseUrl = baseUrl ?? process.env.REACT_APP_SERVICE_API_BASE_URL ?? '';

  let existing = httpClientCache.find((i) => i.url === finalBaseUrl)?.instance;
  if (!existing) {
    existing = createHttpClient(finalBaseUrl, includeAuth);
    httpClientCache.push({ url: finalBaseUrl, instance: existing });
  }
  return existing;
};
