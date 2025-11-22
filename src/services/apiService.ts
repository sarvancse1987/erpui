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
  };

  const response = await client.post(url, data, finalConfig);

  // At this point, response is already a Blob
  if (!(response instanceof Blob)) {
    throw new Error("Expected a Blob but got: " + typeof response);
  }

  return response;
}

export default {
  get,
  getQueryParam,
  post,
  put,
  //postImage,
  del,
  document,
};
