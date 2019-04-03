import http from "./httpService";
import { apiUrl } from "../config.json";
 
const  feesEnd = `${apiUrl}/feecollection`; 
const apiEndpoint = `${apiUrl}/feeallocation`; 

 
export function getfeesDetails(params) {
    return http.get(`${feesEnd}?${params}`)
}

export function getfeecategory(params) {
    return http.get(`${apiEndpoint}?${params}`);
}

export function addFeeCollection(data) {
    return http.post(`${feesEnd}`,data);
}

export function addFeeallocation(params, data) {
  
    return http.post(`${apiEndpoint}?${params}`, data);
}

export function getFeeallocation(params) {
    return http.get(`${apiEndpoint}?${params}`);
}
export function updateFeeallocation(params, data) {


    return http.put(`${apiEndpoint}?${params}`, data);
}

export function deleteFeeallocation(params) {
    return http.delete(`${apiEndpoint}?${params}`);
}


 
 