import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/grade";
const scholasticsEndpoint = apiUrl + "/scholastics";
const skillEndpoint = apiUrl + "/skills";
const subjectEndPoint = apiUrl + "/credits";

export function getGradeList(params) {
  return http.get(`${apiEndpoint}?${params}`);
}

export function insertGrade(data) {
  return http.post(`${apiEndpoint}`, data);
}

export function updateGrade(data) {
  return http.put(`${apiEndpoint}`, data);
}

export function deleteGrade(params) {
  return http.delete(`${apiEndpoint}?${params}`);
}

//TODO: Scholastics API

export const getScholastics = (params) => {
  return http.get(`${scholasticsEndpoint}?${params}`);
}

export const addScholastics = (data) => {
  return http.post(`${scholasticsEndpoint}`, data);
}

export const updateScholastics = (data) => {
  return http.put(`${scholasticsEndpoint}`, data);
}

export function deleteScholastics(params) {
  return http.delete(`${scholasticsEndpoint}?${params}`);
}

// TODO: Skill    
export const getSkills = (params) => {
  return http.get(`${skillEndpoint}?${params}`);
}

export const addSkill = (data) => {
  return http.post(`${skillEndpoint}`, data);
}

export const updateSkill = (data) => {
  return http.put(`${skillEndpoint}`, data);
}

export function deleteSkill(params) {
  return http.delete(`${skillEndpoint}?${params}`);
}


// TODO: Subject Weight    
export const getSubjectWeight = (params) => {
  return http.get(`${subjectEndPoint}?${params}`);
}

export const addSubjectWeight = (data) => {
  return http.post(`${subjectEndPoint}`, data);
}

export const updateSubjectWeight = (data) => {
  return http.put(`${subjectEndPoint}`, data);
}

export function deleteSubjectWeight(params) {
  return http.delete(`${subjectEndPoint}?${params}`);
}