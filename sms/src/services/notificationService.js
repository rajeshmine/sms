import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/notification";

export function addNotification(data) {  
  return http.post(`${apiEndpoint}`, data);
}
