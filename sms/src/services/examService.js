import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/exams";
const sectionEnd = `${apiUrl}/sections`;
const questionsEnd = `${apiUrl}/questions`;
const questionPaperEnd = `${apiUrl}/questionPapers`;
const answerEnd = `${apiUrl}/answerKeys`;


export function getexamname(url) {
    try{
    return http.get(`${apiUrl}/${url}`);
    }catch(err){
        return null;
    }
}

export function getsubjectname(url) {
    return http.get(`${apiUrl}/${url}`);
}

export function insertExamData(data) {
    return http.post(apiEndpoint, data);
}

export function updateExamData(data) {
    return http.put(apiEndpoint, data);
}
export function getExamData(params) {
    return http.get(`${apiEndpoint}?${params}`);
}

export function deleteExamData(params) {
    return http.delete(`${apiEndpoint}?${params}`);
}
// Section
export function insertSection(data) {
    return http.post(sectionEnd, data);
}

export function updateSection(data) {
    return http.put(sectionEnd, data);
}

export function getAllSection(params) {
    return http.get(`${sectionEnd}?${params}`)
}

export function deleteSection(params) {
    return http.delete(`${sectionEnd}?${params}`)
}
// Question
export function InsertQuestions(data) {
    return http.post(questionsEnd, data)
}

export function UpdateQuestions(data) {
    return http.put(questionsEnd, data)
}

export function getAllQuestions(params) {
    return http.get(`${questionsEnd}?${params}`)
}

// Question Paper
export function viewQuestions(params) {
    return http.post(`${questionPaperEnd}?${params}`);
}

export function answerKeys(params) {
    return http.post(`${answerEnd}?${params}`);
}
