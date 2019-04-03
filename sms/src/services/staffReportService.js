import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/staffReport";

export function getStaffList(params) {
  return http.get(`${apiEndpoint}?${params}`);
}


export function getSubjectList(params) {
  return http.get(`${apiEndpoint}?${params}`);
}

export function getMarkReport(params) {
  return http.get(`${apiEndpoint}?${params}`);
}
