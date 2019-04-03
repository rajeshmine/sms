import http from "./httpService";
import { apiUrl } from "../config.json";
const apiEndpoint = apiUrl + "/templates";

export function addTemplates(params, data) {
    return http.post(`${apiEndpoint}?${params}`, data);
}
export async function SGTemplates(url, method, data, config) {
    console.log(url, method, data, config);

    method = method.toUpperCase();
    switch (method) {
        case "GET":
            return await fetch(url, {
                method: method,
                headers: config,
            }).then(response => {

                return response.json()
            })
        case "POST":
            return await fetch(url, {
                method: method,
                headers: config,
                body: JSON.stringify(data)
            }).then(response => {
                return response.json()
            })
        case "PATCH":
            return await fetch(url, {
                method: method,
                headers: config,
                body: JSON.stringify(data)
            }).then(response => {
                return response.json()
            })
        case "DELETE":
            return await fetch(url, {
                method: method,
                headers: config,
            }).then(response => response)
        default:
            break;
    }
}




export function gettemplates(params) {
    return http.get(`${apiEndpoint}?${params}`);
}

export function updateTemplates(params, data) {
    return http.put(`${apiEndpoint}?${params}`, data);
}

export function deletetemplates(params) {

    return http.delete(`${apiEndpoint}?${params}`);
}
