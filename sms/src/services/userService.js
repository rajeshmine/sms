import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/users";
const studentEndpoint = apiUrl + "/students";

export function getselectData(url) {
    return http.get(`${apiUrl}/${url}`);
}

export function getStudentAutoSuggest(params) {
    return http.get(`${studentEndpoint}?${params}`);
}

export function userIdValidate(data) {
    return http.post(`${apiUrl}/ValidateUserId`,data);
}

export function getsuserListData(url) {
    return http.get(`${apiUrl}/${url}`);
}

export function getUser(uid) {
    return http.get(`${apiUrl}/user/${uid}`);
}

export function saveUser(type,params,data) {    
    return http.post(`${apiEndpoint}/${type}?${params}`, data);
}

export function saveUsersExcel(data) {    
    return http.post(`${apiEndpoint}/add`, data);
}

export function deleteUser(type,params) {    
    return http.delete(`${apiEndpoint}/${type}?${params}`);
}

export function changeUser(type,params,data) {    
    return http.put(`${apiEndpoint}/${type}?${params}`,data);
}

