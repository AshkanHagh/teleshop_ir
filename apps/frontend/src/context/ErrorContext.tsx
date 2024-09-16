import { createContext, useContext, useState } from "react"

type SetRetryError = (errorMessage: string | undefined, onRetry: () => void) => void

type ErrorContext = {
    error: string | null
    setRetryError: SetRetryError
    onRetry: () => void
    removeError: () => void
}

const initialState: ErrorContext = {
    setRetryError: () => { },
    error: null,
    onRetry: () => {},
    removeError: () => { }
}

const ErrorContext = createContext<ErrorContext>(initialState)

export const ErrorProvider = ({ children }: { children: React.ReactNode }) => {

    const [error, setError] = useState<string | null>(null)
    const [onRetry, setOnRetry] = useState<(() => void)>(() => {})

    const setRetryError: SetRetryError = async (errorMessage, onRetry) => {
        setError(errorMessage ?? 'مشکلی پیش آمده است')
        setOnRetry(() => onRetry)
    }

    const removeError = () => {
        setError(null)
        setOnRetry(() => {})
    }

    const value: ErrorContext = {
        error,
        onRetry,
        setRetryError,
        removeError
    }

    return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
}

export const useErrorContext = () => {
    return useContext(ErrorContext)
}