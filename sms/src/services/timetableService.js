import http from "./httpService";
import { apiUrl } from "../config.json";

const scheduleTypes = apiUrl + "/scheduleTypeId"
const timetable = apiUrl + "/timetable"

export function getScheduleDetails(params) {
    return http.get(`${scheduleTypes}?${params}`);
}

export function updateclassTimetable(data) {
    return http.put(`${timetable}`, data);
}

export function insertclassTimetable(data) {
    return http.post(`${timetable}`, data);
}
export function getTimeTable(data) {
    return http.post(`${apiUrl}/viewTimetable`, data);
}

export function getsubjectList(url) {
    return http.get(`${apiUrl}/${url}`);
}

export function getstaffList(url) {
    return http.get(`${apiUrl}/${url}`);
}

export function rescheduleTimetable(data) {
    return http.post(`${timetable}`, data);
}