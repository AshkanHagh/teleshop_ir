import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axiosInstance from "../api/axios";
import { useAuthContext } from "../context/AuthContext";
import { useEffect } from "react";
import { RefreshResponse, ResponseError, UserValidation } from "../types/types";

interface FailedRequest {
    config: InternalAxiosRequestConfig
    resolve: (response: AxiosResponse) => void
    reject: (error: AxiosResponse) => void
}

const useAxios = () => {
    const { accessToken, user, updateAuthState } = useAuthContext();

    useEffect(() => {
        const { initData } = Telegram.WebApp;

        let failedRequest: FailedRequest[] = [];
        let isRefreshingToken: boolean = false;
        let _isRetry: boolean = false;
        let tempToken: string | null = null

        const handleFailedRequest = () => {
            failedRequest.forEach(({ config, resolve, reject }) => {
                axiosInstance(config)
                    .then(response => resolve(response))
                    .catch(error => reject(error))
            });
        }

        const handlePolBarzakh = async (originalRequest: InternalAxiosRequestConfig, error: AxiosError<ResponseError>) => {
            try {
                const response = await axiosInstance.post<UserValidation>('auth/pol-barzakh', {
                    initData
                });
                const newAccessToken = response.data.accessToken;
                if (newAccessToken) {
                    updateAuthState(response.data);
                    tempToken = newAccessToken

                    handleFailedRequest()

                    return axiosInstance(originalRequest)
                } else {
                    throw new Error()
                }
            } catch (_) {
                throw error;
            }
        }

        const requestInterceptor = axiosInstance.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                if (accessToken) {
                    const tokenToUse = tempToken || accessToken
                    config.headers['authorization'] = `Bearer ${tokenToUse}`;
                }
                return config;
            }
        );

        const responseInterceptor = axiosInstance.interceptors.response.use(
            response => response,
            async (error: AxiosError<ResponseError>) => {
                const status = error.response?.status;
                const originalRequest = error.config!;

                if (status !== 401 || _isRetry) {
                    return Promise.reject(error);
                }

                if (isRefreshingToken) {
                    return new Promise((resolve, reject) => {
                        failedRequest.push({
                            config: originalRequest,
                            resolve,
                            reject
                        });
                    });
                }

                isRefreshingToken = true;
                _isRetry = true;

                try {
                    const { data } = await axiosInstance.get<RefreshResponse>('auth/refresh')
                    if (data.accessToken) {

                        updateAuthState({ user, accessToken: data.accessToken })
                        tempToken = data.accessToken
                        handleFailedRequest()

                        return axiosInstance(originalRequest)
                    } else {
                        return Promise.reject(error)
                    }
                } catch (e) {
                    const error = e as AxiosError<ResponseError>
                    return handlePolBarzakh(originalRequest, error)
                } finally {
                    failedRequest = [];
                    isRefreshingToken = false;
                    _isRetry = false
                }
            }
        );

        return () => {
            axiosInstance.interceptors.request.eject(requestInterceptor);
            axiosInstance.interceptors.response.eject(responseInterceptor);
        };
    }, [accessToken, user, updateAuthState]);

    return axiosInstance;
}

export default useAxios;