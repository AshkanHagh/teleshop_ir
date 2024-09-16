import { createContext, useContext, useState } from "react"
import type { UserDetail } from "../types/types"

type UpdateAuthStateData = {
    accessToken: string | null
    userDetail: UserDetail | null
}

type AuthContext = {
    accessToken: string | null
    userDetail: UserDetail | null
    updateAuthState: (authData: UpdateAuthStateData) => void
}

const authContextInitialData: AuthContext = {
    accessToken: null,
    userDetail: null,
    updateAuthState: () => { }
}

export const AuthContext = createContext<AuthContext>(authContextInitialData)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null >(null)
    const [userDetail, setUserDetail] = useState<UserDetail | null >(null)

    const updateAuthState = (authData: UpdateAuthStateData) => {
        setAccessToken(authData.accessToken)
        setUserDetail(authData.userDetail)
    }

    const value: AuthContext = {
        accessToken,
        userDetail,
        updateAuthState
    }

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}

export const useAuthContext = (): AuthContext => {
    return useContext(AuthContext)
}