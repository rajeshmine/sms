import http from "./httpService";
import { apiUrl } from "../config.json";
 
const apiEndpoint = apiUrl + "/eventRegistration";

 
export function addEvent(params, data) {
    return http.post(`${apiEndpoint}?${params}`, data);
}

export function getEvent(params) {
    return http.get(`${apiEndpoint}?${params}`);
}
export function updateEvent(params, data) {
    return http.put(`${apiEndpoint}?${params}`, data);
}

export function deleteEvent(params) {
    return http.delete(`${apiEndpoint}?${params}`);
}