import http from "./httpService";
import { apiUrl } from "../config.json";
import  _ from 'lodash'
import Static from "./static";
const apiEndpoint = apiUrl + "/modules";
const rolesEndpoint = apiUrl + "/roles";


export function getModules() {
    return http.get(`${apiEndpoint}`);
}

export function addRoles(params, data) {
   
    return http.post(`${rolesEndpoint}?${params}`, data);
}

export function getRoles(params) {
  
    return http.get(`${rolesEndpoint}?${params}`);
}

export function updateRoles(params, data) {
   
    return http.put(`${rolesEndpoint}?${params}`, data);
}

export function deleteRoles(params) {
    return http.delete(`${rolesEndpoint}?${params}`);
}

export function assignRoles(data) {
    return http.post(`${apiUrl}/roleAssign`, data);
}

export async function rightsData(moduleName, session) {

    if (session && session.data) {
        if (session.data.userType === 'sadmin' || session.data.userType === 'client' || session.data.userType === 'entity') {
          
            let res = Static.getModules()[moduleName];
            await _.map(_.keys(res), async v => {
                await _.map(_.keys(res[v]), k => {
                   res[v][k]["value"] = true;                    
                })
              })
             
            return  res  
        } else {
           
            let res = await getRoles(`client=${session.data.client}&entity=${session.data.entity}&branch=${session.data.branch}&type=${session.data.roles}`)
            
            if (res && res.data.statusCode === 1) {
                let rightsData = res.data.data[0];
              
                return rightsData[moduleName];
            }
        }
    }

}




