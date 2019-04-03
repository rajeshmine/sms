
import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/course";
const endpoint = apiUrl + "/courseType";


export function addSubject(params, data) {
    return http.post(`${apiEndpoint}?${params}`, data);
}

export function getSubject(params) {    
    return http.get(`${endpoint}?${params}`);
}

export function updateSubject(params, data) {
    return http.put(`${apiEndpoint}?${params}`, data);
}

export function deleteSubject(params) {
    return http.delete(`${apiEndpoint}?${params}`);
}



