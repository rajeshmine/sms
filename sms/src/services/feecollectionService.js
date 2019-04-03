import http from "./httpService";
import { apiUrl } from "../config.json";
 
const  feesEnd = `${apiUrl}/feecollection`; 
const feesCategory = `${apiUrl}/feeallocation`; 

 
export function getfeesDetails(params) {
    return http.get(`${feesEnd}?${params}`)
}

export function getfeecategory(params) {
    return http.get(`${feesCategory}?${params}`);
}


 
 