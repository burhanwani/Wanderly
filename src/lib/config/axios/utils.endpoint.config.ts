import { AxiosRequestConfig } from "axios";

function getUrl(config: AxiosRequestConfig) {
  if (config.baseURL && config.url !== undefined) {
    return config?.url?.replace(config.baseURL, "");
  }
  return config.url;
}

export { getUrl };
