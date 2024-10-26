import { useAuthContext } from "../context/AuthContext"
import { Roles } from "../types/types"

const usePermission = (allowedRole: Roles) => {
    const { user } = useAuthContext()
    const userRole = user?.roles

    return userRole?.includes(allowedRole)
}

export default usePermission