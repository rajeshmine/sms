import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/credentials";
 
 
export function addCredentials(data) {
  return http.post(`${apiEndpoint}`,data);
}

// export function getcredentialsDetails(params){
//   return http.get(`${apiEndpoint}?${params}`);
// }

export function editcredentialsDetails(data){
  return http.put(`${apiEndpoint}`,data);
}

export function deleteCredentials(params) {
  return http.delete(`${apiEndpoint}?${params}`);
}


export function getCredentials(params) {
  return http.get(`${apiEndpoint}?${params}`);
}