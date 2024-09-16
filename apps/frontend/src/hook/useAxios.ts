import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axiosInstance from "../api/axios";
import { useAuthContext } from "../context/AuthContext";
import { useEffect } from "react";
import { RefreshResponse, ResponseError, UserValidation } from "../types/types";
import { ErrorResponse } from "react-router-dom";

interface FailedRequest {
    config: InternalAxiosRequestConfig
    resolve: (response: AxiosResponse) => void
    reject: (error: AxiosResponse) => void
}

const useAxios = () => {
    const { accessToken, userDetail, updateAuthState } = useAuthContext();

    useEffect(() => {
        const { initData } = window.Telegram.WebApp

        let failedRequest: FailedRequest[] = []
        let isRefreshingToken = false

        const requestInterceptor = axiosInstance.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                if (accessToken) {
                    config.headers.set('authorization', `Bearer ${accessToken}`)
                }
                return config
            }
        )

        const responseInterceptor = axiosInstance.interceptors.response.use(
            response => response,
            async (error: AxiosError<ResponseError>) => {
                const status = error.response?.status
                const originalRequest = error.config!

                if (status !== 401) {
                    return Promise.reject(error)
                }

                if (isRefreshingToken) {
                    return new Promise((resolve, reject) => {
                        failedRequest.push({
                            config: originalRequest,
                            reject,
                            resolve
                        })
                    })
                }
                isRefreshingToken = true

                try {
                    const { data } = await axiosInstance.get<RefreshResponse>('refresh')
                    if (data.accessToken) {

                        updateAuthState({ userDetail, accessToken: data.accessToken })
                        axiosInstance.defaults.headers.common['authorization'] = `Bearer ${data.accessToken}`

                        failedRequest.forEach(({ config, reject, resolve }) => {
                            axiosInstance(config)
                                .then(response => resolve(response))
                                .catch(error => reject(error))
                        })
                    }
                    axiosInstance
                } catch (error) {
                    // User Validation

                    axiosInstance.post<UserValidation>('/pol-barzakh', {
                        initData
                    }).then(response => {
                        updateAuthState(response.data)

                    }).catch((error: AxiosError<ErrorResponse>) => {
                        return Promise.reject(error)
                    })
                } finally {
                    failedRequest = []
                    isRefreshingToken = false
                }
                return axiosInstance(originalRequest)
            }
        )

        return () => {
            axiosInstance.interceptors.request.eject(requestInterceptor)
            axiosInstance.interceptors.response.eject(responseInterceptor)
        }
    }, [accessToken, userDetail, updateAuthState])

    return axiosInstance
}



export default useAxios