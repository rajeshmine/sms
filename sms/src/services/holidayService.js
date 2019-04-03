import http from "./httpService";
import { apiUrl } from "../config.json";
 
const apiEndpoint = apiUrl + "/holiday";

 
export function addHoliday(params, data) {
    return http.post(`${apiEndpoint}?${params}`, data);
}

export function getHoliday(params) {
    return http.get(`${apiEndpoint}?${params}`);
}
export function updateHoliday(params, data) {
    return http.put(`${apiEndpoint}?${params}`, data);
}

export function deleteHoliday(params) {
    return http.delete(`${apiEndpoint}?${params}`);
}