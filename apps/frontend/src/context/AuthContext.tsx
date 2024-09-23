import { createContext, useContext, useState } from "react"
import type { User } from "../types/types"

type UpdateAuthStateData = {
    accessToken: string | null
    user: User | null
}

type AuthContext = {
    accessToken: string | null
    user: User | null
    updateAuthState: (authData: UpdateAuthStateData) => void
}

const authContextInitialData: AuthContext = {
    accessToken: null,
    user: null,
    updateAuthState: () => { }
}

export const AuthContext = createContext<AuthContext>(authContextInitialData)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null >(null)
    const [user, setUser] = useState<User | null >(null)

    const updateAuthState = (authData: UpdateAuthStateData) => {
        setAccessToken(authData.accessToken)
        setUser(authData.user)
    }

    const value: AuthContext = {
        accessToken,
        user,
        updateAuthState
    }

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}

export const useAuthContext = (): AuthContext => {
    return useContext(AuthContext)
}