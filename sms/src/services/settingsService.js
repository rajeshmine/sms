import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/settingTypes";
const titleEndpoint = apiUrl + "/title";
const religionEndpoint = apiUrl + "/religion";

const getallDatas = apiUrl + "/data";

export function saveSettings(params, data) {
    return http.post(`${apiEndpoint}/new?${params}`, data);
}

export function editSettings(type, params, data) {
    return http.put(`${apiEndpoint}/${type}/settingTypeId?${params}`, data);
}

export function getSettingsList(params) {
    return http.get(`${apiEndpoint}?${params}`);
}

export function getSettingsLists(params) {
    return http.get(`${apiEndpoint}/typeName?${params}`);
}

export function getParticularType(params) {
    return http.get(`${apiEndpoint}/typeName?${params}`);
}

export function deleteParticularType(params) {
    return http.delete(`${apiEndpoint}/delete/settingTypeId?${params}`);
}

export function getSubLists(params) {
    return http.get(`${getallDatas}/${params}`);
}

//title

export function saveSettingsTitle(data) {
    return http.post(`${titleEndpoint}`, data);
}

export function getTitleList() {
    return http.get(`${titleEndpoint}`);
}

export function updateSettingsTitle(data) {
    return http.put(`${titleEndpoint}`, data);
}

export function settingsTitleDelete(params) {
    return http.delete(`${titleEndpoint}?${params}`);
}

export function addgeneralSettings(params,data) {       
    return http.post(`${getallDatas}/${params}`,data);
}

export function editgeneralSettings(params,data) {       
    return http.put(`${getallDatas}/${params}`,data);
}

export function deletegeneralSettings(params,data) {
    return http.delete(`${getallDatas}/${params}`,data);
}

// Religion
export function getReligionList() {
    return http.get(`${religionEndpoint}`);
}

export function saveSettingsReligion(data) {
   
    return http.post(`${religionEndpoint}`, data);
}

export function updateSettingsReligion(data) {
    return http.put(`${religionEndpoint}`, data);
}

export function deleteSettingsReligion(params) {
    return http.delete(`${religionEndpoint}?${params}`);
}


 