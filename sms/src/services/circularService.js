import http from "./httpService";
import { apiUrl } from "../config.json";


const apiEndPoint = apiUrl + "/circular";

// TODO: Subject Weight    
export const getCircularList = (params) => {
  return http.get(`${apiEndPoint}?${params}`);
}

export const addCircularInfo = (data) => {
  return http.post(`${apiEndPoint}`, data);
}

export const updateCircularInfo = (data) => {
  return http.put(`${apiEndPoint}`, data);
}

export const deleteCircularInfo = (params) => {
  return http.delete(`${apiEndPoint}?${params}`);
}