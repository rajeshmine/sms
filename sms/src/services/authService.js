import jwtDecode from "jwt-decode";
import http from "./httpService";

import { apiUrl } from "config.json";

const apiEndpoint = apiUrl + "/login";
const forgotPsw = apiUrl + "/forgotPassword";
const otpValidateEnd = apiUrl + '/otpValidate'
const passwordUpdateEnd = apiUrl + '/passwordUpdate';
const changePswEnd = apiUrl + '/validatepassword';
const tokenKey = "token";

http.setJwt(getJwt());

export async function login(username, password, ref = "", next = "") {
  const result = await http.post(apiEndpoint, { username, password, ref, next });
  localStorage.setItem(tokenKey, result.data.access_token);
  localStorage.setItem("loginInfo", JSON.stringify(result));

  return result;
}

export function loginWithJwt(jwt) {
  localStorage.setItem(tokenKey, jwt);
}

export function logout() {
  localStorage.removeItem(tokenKey);
}

export function getCurrentUser() {
  try {
    const jwt = localStorage.getItem(tokenKey);
    const { identity, user_claims: { data,clientLogo,entity_logo,pictureUrl } } = jwtDecode(jwt);    
    data.pictureUrl=pictureUrl;
    data.clientLogo=clientLogo;
    data.entityLogo=entity_logo;
    return { uid: identity,  data};
  } catch (ex) {
    return null;
  }
}


export function getJwt() {  
  return localStorage.getItem(tokenKey);   
}
 


// Forgot Password
export const forgotPassword = (params) => {
  return http.get(`${forgotPsw}?${params}`)
}

export const otpValidate = (params) => {
  return http.get(`${otpValidateEnd}?${params}`)
}

export const passwordUpdate = (params) => {
  return http.get(`${passwordUpdateEnd}?${params}`)
}

// Change Password
export const passwordValidate = (params) => {
  return http.get(`${changePswEnd}?${params}`)
}
 
export default {
  login,
  loginWithJwt,
  logout,
  getCurrentUser,
  getJwt
};
