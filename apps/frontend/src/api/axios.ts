import axios from "axios";

const axiosInstance = axios.create({
    baseURL: '/api',
    headers: {
        "Content-Type": "json/application"
    },
    withCredentials: true
})

export default axiosInstance