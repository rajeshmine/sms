import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint1 = apiUrl + "/autosuggest";
const apiEndPoint = apiUrl + "/markreport";
const viewEndPoint = apiUrl + "/markreportgenerate";
// const apiEndpoint = apiUrl + "/markreport";

const studentEndPoint = apiUrl + "/allreports";

export function studentAutoSuggest(url) {
   
    return http.get(`${apiEndpoint1}?${url}`);
}

export function getMarkList(url) {
  
    return http.get(`${apiEndPoint}?${url}`);
}


export const studentDataList = (params) => {
  return http.get(`${studentEndPoint}?${params}`);
}

export function getProgressMarkList(url) {
 
  return http.get(`${viewEndPoint}?${url}`);
}
export const addMarkReport = (data) => {
  return http.post(`${apiEndPoint}`, data);
}

export const updateMarkReport = (data) => {
  return http.put(`${apiEndPoint}`, data);
}

export const deleteMarkReport = (params) => {
  return http.delete(`${apiEndPoint}?${params}`);
}

 


