const axios = require('axios');
const {encode,decode} = require('./encryption')
import { getCsrfToken } from "next-auth/react"

const apiClient = (config={}) => {
    const instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_URL+'/api',
        timeout: 10000
    })
    // Add a request interceptor
    instance.interceptors.request.use(async function (config) {
        const token = await getCsrfToken();
        // Do something before request is sent
        config.data = encode(
            {
                method: config.method,
                data: config?.data,
                params: config?.params
            }
        )
        config.method = 'POST';
        // CSRF (Cross-Site Request Forgery):	ใช้การตรวจสอบและใช้งาน CSRF token ร่วมกับการร้องขอผ่าน POST method เพื่อป้องกันการโจมตี CSRF.
        config.headers['X-CSRF-Token'] = token; // Add CSRF token to headers
        // HTTP Header Injection:	ห้ามพิมพ์ HTTP header โดยตรงและใช้ HTTP header API ที่ระบบให้หรือที่สามารถใช้ได้.
        config.headers['Content-Type'] = 'application/json';
        return config;
    }, function (error) {
        // Do something with request error
        return Promise.reject(error);
    });

    // Add a response interceptor
    instance.interceptors.response.use(function (response) {
        
        if (response?.data?.data) {
            response.data = decode(response?.data?.data)
        }
        
        return response;
    }, function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return Promise.reject(error);
    });

    return instance;
}

module.exports = {
    apiClient
}