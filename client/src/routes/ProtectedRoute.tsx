// allow user to open dashboard, profile, etc., only when they have logged in or signed up

import { useAppSelector } from "@/store/hooks"
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

    if(!isAuthenticated){
        return <Navigate to="/login"/>
    }
    return <Outlet/>;
}
export default ProtectedRoute;