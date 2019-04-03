
import http from "./httpService";
import { apiUrl } from "../config.json";

export function holiday(params) {
    return http.get(`${apiUrl}/holiday?${params}`);
}
export function circular(params) {
    return http.get(`${apiUrl}/circular?${params}`);
}

export function course(params) {
    return http.get(`${apiUrl}/courseAttendices?${params}`);
}

export function homeworkReport(params) {
    return http.get(`${apiUrl}/homeworkReport?${params}`);
}

export function assignmentReport(params) {
    return http.get(`${apiUrl}/assignmentReport?${params}`);
}

export function scheduleTypeId(params) {
    return http.get(`${apiUrl}/scheduleTypeId?${params}`);
}


export function feeCollection(params) {
    return http.get(`${apiUrl}/feecollection?${params}`);
}

export function studentAttendance(params) {
    return http.get(`${apiUrl}/studentAttendance?${params}`);
}

export function notificationList(params) {
    return http.get(`${apiUrl}/notification?${params}`);
}


