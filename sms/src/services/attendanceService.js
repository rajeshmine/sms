import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/attendance";
const holidayEndpoint = apiUrl + "/holiday";
const getReports = apiUrl + "/allreports";

export function attendanceAdd(data) {
    return http.post(`${apiEndpoint}`, data);
}

export function getsuserListData(url) {
    return http.get(`${apiUrl}/${url}`);
}

export function getAttendancelist(url) {
    return http.get(`${apiEndpoint}?${url}`);
}

export function getAttendancemonthReport(url) {    
    return http.get(`${apiUrl}/${url}`);
}

export function getAllreports(url) {
    return http.get(`${getReports}?${url}`);
}

export function deleteUser(type, params) {
    return http.delete(`${apiEndpoint}/${type}?${params}`);
}

export function changeUser(type, params, data) {
    return http.put(`${apiEndpoint}/${type}?${params}`, data);
}

export function editAttendance(data) {
    return http.put(`${apiEndpoint}`, data);
}

export function addHoliday(params, data) {
    return http.post(`${holidayEndpoint}?${params}`, data);
}

export function getHoliday(params) {
    return http.get(`${holidayEndpoint}?${params}`);
}
export function updateHoliday(params, data) {
    return http.put(`${holidayEndpoint}?${params}`, data);
}

export function deleteHoliday(params) {
    return http.delete(`${holidayEndpoint}?${params}`);
}