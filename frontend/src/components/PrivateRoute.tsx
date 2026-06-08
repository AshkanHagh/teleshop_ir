import { Navigate, Outlet } from "react-router-dom"
import { useAuthContext } from "../context/AuthContext"
import { Roles } from "../types/types"

type PrivateRouteProps = {
  allowedRoles?: Roles
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuthContext()

  if (user && (!allowedRoles || user.roles.includes(allowedRoles)))
    return <Outlet />

  return <Navigate to="/" />
}

export default PrivateRoute
