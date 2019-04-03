import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/suggest?type";

function suggestUrl(type) {
    return `${apiEndpoint}=${type}`;
}

export function autoSuggest(type, searchTerm = '', pageNum = 1, pageSize = 0) {
    const params = { searchTerm, pageSize, pageNum };    
   
    return http.get(`${suggestUrl(type)}`, { params });
}


