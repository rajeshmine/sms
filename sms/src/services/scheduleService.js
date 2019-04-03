import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/scheduleType/new";
const subjectEndPoint = apiUrl + "/courseType";
const scheduleTypes = apiUrl + "/scheduleTypeId";
const updateSchedule = apiUrl + "/scheduleTypes/edit/scheduleTypeId";
const deleteSchedule = apiUrl + "/scheduleTypes/delete/scheduleTypeId"

export function scheduleInsert(params, data) {
    return http.post(`${apiEndpoint}?${params}`, data);
}

export function scheduletimetableInsert(params, data) {
  
    return http.post(`${apiUrl}/scheduleTimetable/new?${params}`, data);
}

export function getSubjectsList(params) {
  
    return http.get(`${subjectEndPoint}?${params}`);
}

export function getScheduleDetails(params) {
    return http.get(`${scheduleTypes}?${params}`);
}

export function updateScheduleDetails(params, data) {    
    return http.put(`${updateSchedule}?${params}`, data);
}

export function deleteScheduleDetails(params) {
    return http.delete(`${deleteSchedule}?${params}`);
}


export function getTermList(url) {
    return http.get(`${scheduleTypes}?${url}`);
}


export function academicDateRange(params){
    return http.get(`${apiUrl}/entities?${params}`)
}
