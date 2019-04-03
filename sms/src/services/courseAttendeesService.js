import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/courseAttendices";

export function addCourseAttendees(data) {
    return http.post(`${apiEndpoint}`, data);
}

export function getCourseAttendees(params) {
    return http.get(`${apiEndpoint}?${params}`);
}

export function deleteCourseAttendees(params) {
    return http.delete(`${apiEndpoint}?${params}`);
}

export function updateCourseAttendees(data) {
    return http.put(`${apiEndpoint}`, data);
}