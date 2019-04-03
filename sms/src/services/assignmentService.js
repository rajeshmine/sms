import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/assignmentReport";
const homeworkEndpoint = apiUrl + "/homeworkReport";
const assignEndpoint = apiUrl + "/scheduleTypeId";
const parassignEndpoint = apiUrl + "/scheduleType/byName";
const studentListEnd = apiUrl + "/students";
const allocatestudentmarks = apiUrl + "/allreports";

export function getAssignments(url) {
    return http.get(`${apiUrl}/${url}`);
}

export function getStudentsReport(url) {
    return http.get(`${allocatestudentmarks}?${url}`);
}

export function addAssignments(data) {
    return http.post(`${apiEndpoint}`, data);
}

export function addHomeworks(data) {
    return http.post(`${homeworkEndpoint}`, data);
}

export function editAssignments(data) {
    return http.put(`${apiEndpoint}`, data);
}

export function editHomeworks(data) {  
    return http.put(`${homeworkEndpoint}`, data);
}

export function deleteAssignments(params) {   
    return http.delete(`${apiEndpoint}?${params}`);
}

export function deleteHomeworks(params) {   
    return http.delete(`${homeworkEndpoint}?${params}`);
}

export function getAssignmentList(url) {
    return http.get(`${assignEndpoint}?${url}`);
}

export function getsingleAssignment(url) {
    return http.get(`${parassignEndpoint}?${url}`);
}

export function getStudentList(params) {
    return http.get(`${studentListEnd}?${params}`)
} 

export function viewAssignmentReport(params) {
    return http.get(`${apiEndpoint}?${params}`)
}

export function viewHomeworkReport(params) {
    return http.get(`${homeworkEndpoint}?${params}`)
}