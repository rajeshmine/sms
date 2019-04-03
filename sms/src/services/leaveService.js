import http from "./httpService";
import { apiUrl } from "../config.json";
 
const leaveEnd = `${apiUrl}/leave`;  

export function leaveInsert(params) {    
    return http.post(`${leaveEnd}?${params}`);
}

export function getAllLeaves(params) {
    return http.get(`${leaveEnd}?${params}`)
}

export function updateLeaves(params) {
    return http.put(`${leaveEnd}?${params}`)
}
 
 