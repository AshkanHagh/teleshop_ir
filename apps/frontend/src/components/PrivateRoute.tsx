import { Navigate, Outlet } from "react-router-dom"
import { useAuthContext } from "../context/AuthContext"

type PrivateRouteProps = {
    allowedRoles?: 'owner'
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
    const { user } = useAuthContext()

    if (user && (!allowedRoles || allowedRoles === user.role)) return <Outlet />

    return <Navigate to='/' />
}

export default PrivateRoute