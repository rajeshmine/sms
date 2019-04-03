import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/lesson";


export function addSyllabus(params, data) {
    return http.post(`${apiEndpoint}?${params}`, data);
}

export function getSyllabus(params) {
    return http.get(`${apiEndpoint}?${params}`);
}

export function updateSyllabus(params, data) {
    return http.put(`${apiEndpoint}?${params}`, data);
}

export function deleteSyllabus(params) {
    return http.delete(`${apiEndpoint}?${params}`);
}