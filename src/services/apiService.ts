import type { AxiosRequestConfig } from "axios";
import { getHttpClient } from "./http";

export async function get(url: string): Promise<any> {
  const client = getHttpClient();
  return client.get(url);
}

export async function getQueryParam(url: string, params?: Record<string, any>): Promise<any> {
  const client = getHttpClient();
  return client.get(url, { params });
}

export async function post(url: string, data: any): Promise<any> {
  const client = getHttpClient();
  return client.post(url, data);
}

export async function put(url: string, data: any): Promise<any> {
  const client = getHttpClient();
  return client.put(url, data);
}

export async function del(url: string, data?: any): Promise<any> {
  const client = getHttpClient();
  return client.delete(url, { data });
}

export async function document(
  url: string,
  data: any,
  config: AxiosRequestConfig = {}
): Promise<Blob> {
  const client = getHttpClient();

  const finalConfig: AxiosRequestConfig = {
    ...config,
    responseType: "blob",
    headers: {
      ...(config.headers ?? {}), // always defined
    },
  };

  // 🔥 Safe check — no TypeScript error
  if (data instanceof FormData) {
    delete finalConfig.headers!["Content-Type"];
  }

  const response = await client.post(url, data, finalConfig);

  return response.data as Blob;
}

export async function upload(url: string, formData: FormData) {
  const client = getHttpClient();

  return await client.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}

export async function getPdf(url: string): Promise<any> {
  const client = getHttpClient();
  const response = await client.get(url, { responseType: "blob" });
  return response; // <-- this is the Blob
}

export default {
  get,
  getQueryParam,
  post,
  put,
  //postImage,
  del,
  document,
  upload,
  getPdf
};
