
import {apiUrl} from './../config.json'
import { post } from "axios";
export function FileUpload(file) {
    const url = `${apiUrl}/uploadfile`;
    const formData = new FormData();
    formData.append('file', file)
    const config = {
        headers: { 'content-type': 'multipart/form-data' }
    }       
    return post(url, formData, config)
}


