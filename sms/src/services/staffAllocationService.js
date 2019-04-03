import http from "./httpService";
import {    apiUrl} from "../config.json";

const apiEndpoint = apiUrl + "/workAllocation";

export function InsertStaffAlloc(data) {
    return http.post(`${apiEndpoint}`, data);
}

export function getStaffAllocList(params) {
    return http.get(`${apiEndpoint}?${params}`);
}

export function deleteStaffAllocation(params) {
    return http.delete(`${apiEndpoint}?${params}`);
}


export function editStaffAllocation(data) {    
    return http.put(`${apiEndpoint}`, data);
}
 
